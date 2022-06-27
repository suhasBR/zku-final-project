import React from 'react'

function Working() {
  return (
    <div className="flex mt-20 flex-col px-48">
        <h1 className="text-2xl mb-4 font-bold">Create Email Verified Anonymous Identity</h1>
        <p className="text-base">Click connect wallet button to connect your wallet</p>
        <div className="my-4">
            <h2 className="text-base font-bold">Phase 1</h2>
            <p className="text-base">Enter your email, secret numeric password. <br></br> 
            Create your anonymous identity using 'Create Semaphore Identity' button
            <br></br>
            Copy down the public hash. <br></br>
            Identity string will be stored on the browser automatically</p>
        </div>

        <div className="my-4">
            <h2 className="text-base font-bold">Phase 2</h2>
            <p className="text-base">Enter your public hash (copied in phase 1) and secret numeric password <br></br> 
            Check email for random string and enter that
            <br></br>
            Commit data and sign transaction using your wallet
            <br></br>
            After successful transaction click the verify button  to confirm if <br></br> your identity has been email-verified
            </p>
        </div>


    </div>
  )
}

export default Working