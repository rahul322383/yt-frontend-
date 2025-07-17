"use client";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h1 className="text-4xl font-bold mb-6 text-center">Privacy Policy</h1>

      <p className="mb-4">
        Your privacy is super important to me. Here’s how I handle your info when you use this app:
      </p>


      <h2 className="text-2xl font-semibold mb-2">Information Collection</h2>
      <p className="mb-4">
        I collect only the information necessary to make the app work properly, like your username, comments, and any data you provide when you interact with the app.
      </p>

      <h2 className="text-2xl font-semibold mb-2">How I Use Your Info</h2>
      <p className="mb-4">
        Your info helps me keep the app running smoothly, manage comments, likes, subscriptions, and personalize your experience.
      </p>


      <h2 className="text-2xl font-semibold mb-2">Data Sharing</h2>
      <p className="mb-4">
        I don’t sell or share your personal info with anyone outside the app. Your data stays safe and private.
      </p>

      <h2 className="text-2xl font-semibold mb-2">Security</h2>
      <p className="mb-4">
        I do my best to keep your data secure using modern tools and best practices, but remember, no system is 100% foolproof.
      </p>

      <h2 className="text-2xl font-semibold mb-2">Cookies & Tracking</h2>
      <p className="mb-4">
        This app uses cookies or similar tech only to improve your experience and for authentication purposes.
      </p>

      <h2 className="text-2xl font-semibold mb-2">Your Choices</h2>
      <p className="mb-4">
        You can manage or delete your comments anytime and control your profile info via the app settings.
      </p>

      <h2 className="text-2xl font-semibold mb-2">Changes to This Policy</h2>
      <p className="mb-4">
        If I update this policy, I’ll post the changes here. Keep an eye out so you know how your info is handled.
      </p>
      

      <p className="mt-8 text-sm text-center text-gray-500">
        &copy; {new Date().getFullYear()} Rahul's Video Streaming App
      </p>
    </div>
  );
}
