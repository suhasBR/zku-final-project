import React from 'react'

function Navbar({account,clickHandler,connectHandler}) {
  return (
    <div className="w-full px-8 py-4 flex flex-row justify-between bg-[#264653] items-center">
        <h1 className="text-white text-3xl font-bold">zkEmailAuth</h1>
        {
            !account ? (
                <button
                onClick={connectHandler}
                className="w-36 px-4 py-2 bg-cyan-300 rounded-xl"
              >
                Connect Wallet
              </button>
            ):(
                <div className="flex flex-row w-[30%] justify-between">
                    <h2 onClick={() => clickHandler(0)}
                    className="text-xl text-white cursor-pointer">How it Works</h2>
                    <h2 onClick={() => clickHandler(1)}
                    className="text-xl text-white cursor-pointer">Phase1</h2>
                    <h2 onClick={() => clickHandler(2)}
                    className="text-xl text-white cursor-pointer">Phase2</h2>
                </div>
            )
        }
        
    </div>
  )
}

export default Navbar