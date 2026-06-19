'use client'; //biar onClicknya bisa dipake

import Link from 'next/link';
import { useState } from 'react';

const Navbar = () => {
   const [active, setActive] = useState(false);
   // setActive = function, active = penyimpanannya, isi dari active(false)

  const isLoggedIn = false;

  const handleClick = () => {
    setActive(!active);
    // !active itu biar ketika di click berubah status jadi true-false-true-false
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
              {/* md:static absolute untuk menyesuaikan layar hp dan laptop */}
              {/* left-1/2 - translate-x-1/2 untuk posisi center hp secara horizontal, biar enak */}
              {/* flex-col bar vertikal di hp, flex-row biar horizontal di laptop */}
              {/* bg-slate, latar belakang di hp, bg-transparent biar transparan saat di laptop */}
              {/* w-full, kotak menunya 100% lebar layar hp, w-auto dibikin otomatis ngikutin panjang menu
              di laptopnya */}
              {/* opacity itu tingkat transparansi */}
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
                {/* hidden block itu blackpoint, jadi ketika ukurannnya lebih akan dihidden */}
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