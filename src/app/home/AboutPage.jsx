"use client";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h1 className="text-4xl font-bold mb-6 text-center">About This Project</h1>

      <p className="text-lg mb-4 leading-relaxed">
        Hey there! 👋 I'm Rahul, a new student diving into the world of web development.
        This project is my journey to learn and build a cool video streaming app with
        React, Node.js, and MongoDB. 
      </p>

      <p className="text-lg mb-4 leading-relaxed">
        This app includes features like video uploading, comments, likes, subscriptions,
        and more — kinda like YouTube but my own style! It’s all about learning, experimenting,
        and leveling up my coding skills.
      </p>

      <p className="text-lg mb-4 leading-relaxed">
        I’m open to feedback and always ready to improve. If you wanna connect, chat about
        code, or just say hi, hit me up!
      </p>

      <div className="mt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Rahul's Video Streaming App. All rights reserved.
      </div>
    </div>
  );
}
