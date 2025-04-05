"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NavLinks() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed top-0 right-0 z-50 p-4">
      <Button
        onClick={toggleMenu}
        variant="ghost"
        size="icon"
        className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 right-4 w-64 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg shadow-lg p-4 text-white">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="block p-2 hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="block p-2 hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/components"
                  className="block p-2 hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  My Components
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="block p-2 hover:bg-white/10 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Contact Us
                </Link>
              </li>
              <li className="pt-2 border-t border-white/20">
                <Link
                  href="/privacy-policy"
                  className="block p-2 hover:bg-white/10 rounded-md transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="block p-2 hover:bg-white/10 rounded-md transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/cancellation-refund"
                  className="block p-2 hover:bg-white/10 rounded-md transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Cancellation & Refund
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-delivery"
                  className="block p-2 hover:bg-white/10 rounded-md transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Shipping & Delivery
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}

