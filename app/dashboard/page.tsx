"use client";

import Features from "../components/DashboardComponents/Features";
import IntialiSection from "../components/DashboardComponents/IntialiSection";

const page = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center  py-2 px-5">
        <IntialiSection />
        <Features />
      </div>
    </>
  )
}

export default page