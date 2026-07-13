import React from 'react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes } from "react-icons/fa";
import Auth from '../pages/Auth';

function AuthModel({onClose}) {
    const {userData} = useSelector((state)=>state.user)

    useEffect(()=>{
        if(userData){
            onClose()
        }

    },[userData , onClose])

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4'>
        <div className='relative w-full max-w-md'>
            <button onClick={onClose} className='absolute top-8 right-6 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer text-xl z-50'>
             <FaTimes size={18}/>
            </button>
            <Auth isModel={true}/>
        </div>
    </div>
  )
}

export default AuthModel
