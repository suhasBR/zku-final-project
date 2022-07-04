import React from 'react'

function Working() {
  return (
    <div className="flex mt-20 flex-col items-left px-48">
        <h1 className="text-2xl mb-4 font-bold">Create Email Verified Anonymous Identities & Private Groups</h1>
        <p className="text-base w-[80%]">Click connect wallet button to connect your wallet.<br></br>
        Navigate to Groups, enter your private domain (like tesla.com) and check your corresponding groupdId. 
        <br></br>If the group does not exist, you can create one by entering the details
        
        </p>
        <div className="my-4">
            <h2 className="text-base font-bold">Phase 1</h2>
            <p className="text-base">Enter your email, secret numeric password and group ID to join <br></br> 
            Create your anonymous identity using Create Semaphore Identity button
            <br></br>
            Copy down the public hash. <br></br>
            Identity string will be stored on the browser automatically</p>
        </div>

        <div className="my-4">
            <h2 className="text-base font-bold">Phase 2</h2>
            <p className="text-base">Enter your public hash (copied in phase 1), secret numeric password and confirm group ID <br></br> 
            Check email for random string and enter that
            <br></br>
            Commit data and sign transaction using your wallet
            <br></br>
            After successful transaction click the verify button  to confirm if <br></br> your identity has been email-verified and check the groupId your identity belongs to
            </p>
        </div>


    </div>
  )
}

export default Working