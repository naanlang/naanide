Async & Concurrency
-----
This guide describes Naan's concurrency model and async execution.

### Overview

Naan has a continuously executing foreground that is asynchronously interrupted by JavaScript callbacks and its own futures. The Naan concurrency functions provide these capabilities:

- the foreground can defer interrupts during critical sections
- future executions can be allocated and scheduled
- executing code can suspend until signaled
- arbitration among suspended code after waking

The following sections describe these capabilities and the Naan primitive _nonce_ that delivers these features.

While each Naan instance only utilizes one CPU core directly, Naan supports deeply integrated worker threads for both web browsers and NodeJS. These provide true parallel processing to the maximum available in the host computer. Please see the [Workers](Workers.md) document for details.

### Foreground & Interrupts

Naan has continuous, preemptable foreground execution. Normally the foreground doesn't need to concern itself with interrupts, but it can protect critical sections for a limited amount of time.

The foreground calls `sprint()` to suspend interrupts until the current stackframe exits, either by return or exception. The interpreter will throw an exception if the foreground has been unresponsive for more than ten seconds.

In many cases the foreground is running the REPL and is suspended most of the time waiting for user input. No host CPU cycles are consumed during this time. Asynchronous code can initiate a foreground batch operation, which executes as if requested through the REPL and then resumes the REPL loop.

When an interrupt begins it starts as non-interruptable and runs until complete or blocked. If blocked then the interrupt code will be suspended, so attention to design is required for proper synchronization of access to shared data structures. The design effort is mitigated by the lack of preemption.

### Nonce

Naan's nonce datatype provides core functionality for managing concurrency. A nonce provides:

- a condition variable that can be waited and signaled
- communications with futures
- transient storage for Naan's persistent execution

A nonce is allocated with `new(nonce)` or implicitly returned when a future is created. A nonce is a Naan dictionary, so the participant code can store any additional information needed for communication.

A basic nonce offers three methods:

- `wait()`
- `signal(value)`
- `reset()`

When first allocated the nonce is in an unsignaled state. Any code that waits on the nonce will be suspended along with its continuation (parents on the call stack) until the nonce is signaled. Any number of waiters can exist. When the nonce is signaled then each waiter will eventually resume execution, with its `wait()` call returning the signaled value. Any calls to wait() will complete immediately with the same value.

From the signaled state the nonce can be reset back to the unsignaled state. After this any new waiters will again be suspended until the nonce is signaled again.

### Futures

A future is an object that encapsulates a possible future execution. Futures can be scheduled or unscheduled. A scheduled future will be eligable to run after the specified millisecond delay, which defaults to zero, but it will run from the background.

A future is created with `future(<procedure>, [delay])` and returns a special nonce with three methods:

- `wait()`
- `cancel(value)`
- `run(delay)`

The nonce is signaled when the future begins execution, but because the future is already executing it will normally complete before the waiters do. If the future is blocked then the waiters may execute before it resumes.

If a future is scheduled but has not yet begun then execution can be either rescheduled with `run(delay)` or canceled. Repeatedly rescheduling a future before its delay expires will defer execution indefinitely. This is useful when code should execute only after a sufficient delay, such as with a timeout handler.

### Example

In this example, a waiter function wishes to suspend until an actor function completes its task. The waiter allocates the actor and then waits on its completion.

```
Play-lng> function waiter(local pending) {
    pending = new(nonce)
    actor = future(function() {
        printline("actor")
        sleep(1000)
        pending.signal("done")
    })
    printline("start")
    actor.run()
    printline("running")
    printline(pending.wait())
}
$: waiter

Play-lng> waiter();
start
running
actor					// <- 1-second delay after "actor"
done
$: "done"
```
In the code above, `waiter` done the following:

1. allocates a nonce
2. creates an actor that will, when run, delay 1 second and signal "done"
3. prints "start"
4. tells the actor to begin (though that doesn't actually happen yet)
5. prints "running" while both waiter and actor can run
6. waits for the signal from actor
7. prints the signaled result

The "running" line prints before "actor" because executing the `.run()` method on a future makes it eligable for execution, but does not preempt the running code. If you change the line `actor.run()` to `actor.run().wait()` then `waiter` is forced to suspend until the actor's future begins. This prints "actor" before "running" because the future reaches its call to `sleep()` before `waiter` can resume and print "running".

### Promises

Naan interacts seamlessly with JavaScript promises, which is often required when working with external libraries. The runtime library function `await(promise)` suspends the caller until the the promise is settled, returning a two-element tuple `(error, result) with one false and the other non-false depending on whether the promise was resolved or rejected.

The following example runs in NodeJS:

```
Play-lng> closure dnsLookup(hostname, local dnsp, error, data) {
	dnsp = js.r("dns").promises
	`(error, data) = await(dnsp.lookup(hostname, { all: true }))
	if data
		data = new(data)       // convert JavaScript objects to Naan
	else
		error.toString()       // error string
}
$: dnsLookup

Play-lng> dnsLookup("microsoft.com");
$: [
    { address: "104.215.148.63", family: 4 },
    { address: "40.112.72.205", family: 4 },
    { address: "40.113.200.201", family: 4 },
    { address: "20.112.52.29", family: 4 },
    { address: "20.81.111.85", family: 4 }]

Play-lng> dnsLookup("' '.com");
$: "Error: getaddrinfo ENOTFOUND ' '.com"
```
Embedding Naan concurrency functions inside of Promise chains does not work correctly in the general case. Naan expects to suspend an entire continuation (call chain) with `nonce.wait()`, but inside of Promise callbacks part of the call chain is JavaScript native code. This can result in Naan being unable to resume execution after a nonce is signaled, causing the code to hang. Naan exceptions can also be problematic for callbacks. 

It is fully acceptable to embed Promise chains inside of Naan, as long as the Naan code in the callbacks doesn't attempt to use Naan concurrency functions. However best results are obtained by converting outside Promises to Naan concurrency with `await()` as soon as possible.

### Sequential and Parallel Operations

To execute asynchronous operations sequentially, it is only necessary to wait on each one. Unlike other programming languages there is no need for the container function to be marked "async", and there are no restrictions on mixing asynchronous and synchronous calls in Naan. Asynchronous code can throw exceptions or return normally just like synchronous code.

A series of sequential steps can be wrapped in a function and executed concurrently using a future, which returns a nonce that can be waited upon. Thus complex networks of sequential and parallel operations can be easily implemented.

To execute asynchronous operations in parallel it is easiest to use the Naan library function `asyncArray(array, maxconcurrent, callback)` which returns a nonce. This takes an array, the number of maximum concurrent operations, and a callback as arguments. Callback is invoked asynchronously for each member of the array until `maxconcurrent` are simultaneously active. As each of those completes then processing of the next element in the array begins. The callback can append elements to the array on the fly if additional work is needed. Finally when all elements have been processed the returned nonce is signaled and the operation is complete.

The Naan frameworks make extensive use of of `asyncArray` for building projects and copying files, achieving speed through high density network activity.
