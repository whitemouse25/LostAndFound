import React from "react";
import { Link } from "react-router-dom";
import fanshaweLogoSrc from "../assets/fanshawe-logo.png";
import fanshawehero from "../assets/hero.png"; // Make sure to add this logo to your assets folder
import Navbar from "../components/Navbar";

function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white flex flex-col">
        {/* Main Content */}
        <div className="flex-1">
          {/* Hero Section */}
          <section className="relative">
            <div className="w-full h-[600px] overflow-hidden">
              <img
                src={fanshawehero}
                alt="Students walking on campus"
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                <h1 className="text-5xl md:text-5xl font-bold max-w-3xl mt-12">
                  "Lost it? Find it here! Your Campus Connection for reclaimed
                  tresures"
                </h1>
                <button className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 cursor-pointer rounded-md transition">
                  Reclaim now
                </button>
              </div>
            </div>
          </section>

          {/* 3 Easy Steps Section */}
          <section className="py-12 px-4">
            <div className="container mx-auto">
              <h2 className="text-4xl font-bold text-center mb-8 pb-2 border-b-4 border-black inline-block mx-auto">
                3 Easy & Found Steps
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Step 1 */}
                <div className="bg-red-600 text-white rounded-lg overflow-hidden">
                  <div className="p-6 text-center">
                    <h3 className="text-2xl font-bold mb-4">REPORT</h3>
                    <div className="text-8xl font-bold mb-4">1</div>
                    <p className="text-lg">Report lost or found items</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-red-600 text-white rounded-lg overflow-hidden">
                  <div className="p-6 text-center">
                    <h3 className="text-2xl font-bold mb-4">SEARCH</h3>
                    <div className="text-8xl font-bold mb-4">2</div>
                    <p className="text-lg">Admin search database daily</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-red-600 text-white rounded-lg overflow-hidden">
                  <div className="p-6 text-center">
                    <h3 className="text-2xl font-bold mb-4">CLAIM</h3>
                    <div className="text-8xl font-bold mb-4">3</div>
                    <p className="text-lg">claim your found items in person</p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-10">
                <button className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-12 cursor-pointer rounded-md transition">
                  Reclaim now
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default Home;
