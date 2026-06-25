'use client'; 

import Link from 'next/link';
import { useState } from 'react';

const Navbar = () => {
   const [active, setActive] = useState(false);

  const isLoggedIn = false;

  const handleClick = () => {
    setActive(!active);
  };

  return (
    <div className="navbar py-6">
      <div className="container mx-auto px-4">
        <div className="navbar-box flex items-center justify-between">
          <div className="logo">
    
          </div>
          
          {isLoggedIn && (
            <>
              <ul className={`menu flex items-center gap-12 md:static absolute 
              ${active ? 'top-24 opacity-100' : 'top-20 opacity-0'} 
              left-1/2 -translate-x-1/2 md:translate-x-0 md:flex-row flex-col
              md:bg-transparent bg-emerald-600 w-full md:w-auto md:py-0 py-10 text-blue-300
              md:text-black transition-all md:opacity-100 md:transition-none md:text-base`}> 
                <li>
                  <Link href='#beranda'>Beranda</Link>
                </li>
                <li>
                  <Link href='#layanan'>Pembayaran</Link>
                </li>
                <li>
                  <Link href='#pengajuan'>Pengajuan</Link>
                </li>
                <li>
                  <Link href='#kontak'>Kontak</Link>
                </li>
              </ul>
              
              <div className='md:hidden block' onClick={()=> handleClick()}> 
                <i className="ri-menu-fill ri-2x font-bold"></i>
              </div>
            </>
          )}

          {!isLoggedIn && (
            <div className="text-sm font-medium text-gray-500">
              <Link href="#bantuan" className="hover:text-blue-600">Bantuan</Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Navbar