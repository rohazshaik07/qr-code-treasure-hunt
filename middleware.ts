import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Skip middleware for API routes and admin routes
  if (
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/verify" ||
    request.nextUrl.pathname.startsWith("/privacy-policy") ||
    request.nextUrl.pathname.startsWith("/terms-and-conditions") ||
    request.nextUrl.pathname.startsWith("/cancellation-refund") ||
    request.nextUrl.pathname.startsWith("/shipping-delivery") ||
    request.nextUrl.pathname.startsWith("/contact-us")
  ) {
    return NextResponse.next()
  }

  // Check if verification is enabled via API
  const verificationStatusResponse = await fetch(`${request.nextUrl.origin}/api/verification-status`)
  const { verificationEnabled = true } = await verificationStatusResponse.json()

  // If verification is disabled, allow access
  if (!verificationEnabled) {
    return NextResponse.next()
  }

  // Get registration ID from cookie
  const registrationId = request.cookies.get("registration_id")?.value

  // If no registration ID, redirect to home
  if (!registrationId) {
    return NextResponse.redirect(new URL("/?error=not_verified", request.url))
  }

  // Check if user is verified via API
  const verifyResponse = await fetch(`${request.nextUrl.origin}/api/verify?registrationId=${registrationId}`)
  const verifyData = await verifyResponse.json()

  // If not verified, redirect to home
  if (!verifyData.verified) {
    return NextResponse.redirect(new URL("/?error=not_verified", request.url))
  }

  // Continue to protected route
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

