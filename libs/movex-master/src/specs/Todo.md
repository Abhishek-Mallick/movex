---
noteId: "1c13b2a0b51f11edadd4d72b1615afa0"
tags: []

---

## Doing

## To Do

Examples/Show Case to add to the docs. Both as Demo running with the server and also running only on the client.

BUG: There is an interesting bug, where if a client disptached a private action once, and then does it again with a diff value the peers states get into a mismatch.
 I think it's because the action doesnt get stored in the patch anymore on the master? Need to look into it
 - this is actually because when there are multiple actions of the same kind, what happens sometimes happens is this:
     - // if one action rewrite a state field that 
      //  doesnt let an subsequent action to rewrite it. so it just returns prev on subsquequent

Bug/Nice to have: [masterLocal, probably SocketAsWell]  If two clients bind to same resource simultanoeusly, or super close to eahch other, their both take the available first slot in rps locally – but I imagine only one does it for real. Anyhow, it should be able to wait – as the store has a locking system, and only do it once ready.
// But this might be an issue with the way getSlots works on the client in RPs. Need a better system I guess
  - I think this is not a bug, but an actual need for a bit of a feature - to be able to swork with server only generated values or state (such as ids, random stuff, etcc), end thus be able to get those, but in that case the dispatch need NOT TO optimistically update local state, but wait for the master to sync! I believe this should work, In the future we culd have some special Movex Value creators such as Movex.createRandom() or createId or etc..which will turn off the optimistic local update by default


## Backlog

## Done

Jun 7th

Deployed Movex-docs. Now I'm thinking about the examples/showcase to add to the docs.

Sometime in Late May

Wite the SocketIO into MovexIO so it can be used. The archietcture looks like this:

Ideal Version:
An application (such as a game) uses Movexon the client (React for eg) to deal with it multiplayer state

The application code gets pushed from github to Matter.io or matter cloud, where the movex-backend runs on the server making the connection to movex(-client)

Manual Version:

The code gets pushed manually to matter.io, or run manually by importing matterio-backend and connecting it to movex-server

So next Steps:

On Matterio I load movex. I instantiate MovexMaster with a SocketIO Emitter. I also need to instantiate MovexClient with a SocketIO Emitter, so that means the SocketIO lives here no?

Add an app sample to e2e the movex-backend (socket-io server Emitter) with the movex-client (socket-io client Emitter) with the whole pipeline working (locally)

Sometime in May

- Done/ Add reconciliation handler or MovexMaster 

- Make the types work between resources and create movex instance on client.
  - Maybe redefine the Resource Reducer Input, The Resource Handler

May 3rd

Managed to mock Movex and MockEmitter in a way it was origianlly intended – to be jsut a transport layer not to touch business logic. And now I am at the point 
where I can bing in the MasterServer to take the load off the mocker (so the logic leaves inside the real codebase not a test).

April 6th

I managed to start the Orchestration process, and where I left off is the Mock Emitter connecting the master with the clients. Need some hooking there but otherwise 
I'm there. It works with one client. Now is time for multiple.

After this, the orchestration should be much simpler, and the testing of the fwd and xreconciliation actions much more straightforward as well.

TODO After this works:
- Test peer state gets updated correctly
- Test the reconciliatory actions after the private state gets revealed
- Implement the Emitter for Socket.IO

--

Today (March 29) I worked on adding the MovexMaster as the Master Orchestrator, and changed the old Movexmaster into MovexMasterResource.
I also added MovexClientResource which used to be the old MovexResource.

This change is needed mainly to be able to write all the code inside Movex, even the one that lives only on master or the io portion. A code that lives in the codebase is a code that can be tested. All others are possibilities and opportunities for errors.

I've introduced the concept of MovexIO (WIP), to abstract away the socket/local/test etc protocol that makes the client server communication possible. So then again it's easy to setup in a testing environment.

Outcomes after WIP is done:
- createMasterEnv is removed or very very thin - no business logic
- the socket layer is abstracted by movexIO
- able to orchestrate the whole master/client connection and test each client getting the correct resource state

Next To Do

- rewrite Movex, the entry file. All the previous resource CRUD methods can be removed and only the simple (action/reducer) API alowed
  - this also means I can rewrite it to not be socket/io connection agnostic, and thus to be able to provide a tester. 
  - alos, with this occasion, all the master resource to client resource hooking can happen in here inside the registerResource! (onDispatched -> emitAction, onFwdAction, onReconciliatoryActions), and this file will be the tested one! 

----

- Now/ work on MovexMaster + masterEnv
  - I feel the need to have a MovexClient, split form the Movex (Client) SDK, in order to design and test the master/client orchestration but without the need to fire up the whole system. Hmm :/
    - Here it would be where the onFwdAction, onReconciliatoryAction, reconciliation and resynchornization logic would live
    - This should be split from the MovexClientSDK so it can be easily tested
    - Also, the Movex (on Client) could be allowed to load the Master in it to run all locally if so needed. Some usecases could be for not wanting to have another state management for the single player mode of a multiplayer game. Another when there is no server, but just a Peer to Peer arch, where one of the peers becomes the master.

- Next to do: Movex becomes MovexClient and MovexClient becomes the client portion that reconciles and resynchronizes the state from master! So it can be part of the logic 
---

    - What shoould the master return for the reconciliation portion?
      - The series of FWD and Ack for each client no? no cause I don't have the clients there
      - and the nthe outside will map them and forward them=

- Done/ work on $canReconcileState part