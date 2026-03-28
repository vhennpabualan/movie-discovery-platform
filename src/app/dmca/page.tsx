'use client';

export default function DMCAPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-gray-300 leading-relaxed min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-8">DMCA Policy</h1>
      
      <section className="space-y-6 bg-netflix-dark-secondary p-8 rounded-xl border border-netflix-gray/10 shadow-xl">
        <p>
          <span className="text-white font-medium">Movie Discovery Platform</span> respects the intellectual property rights of others. 
          In accordance with the Digital Millennium Copyright Act (DMCA), we respond to 
          claims of copyright infringement reported to our team.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 border-b border-netflix-gray/20 pb-2">1. Content Ownership</h2>
        <p>
          This platform <strong>does not host, store, or upload</strong> any 
          video files. All content is provided by third-party services. This site functions as a 
          technical interface to content already available on the public internet.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 border-b border-netflix-gray/20 pb-2">2. Removal Requests</h2>
        <p>
          If you are a copyright owner and wish to report an infringement, please provide:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-sm">
          <li>The copyrighted work being infringed.</li>
          <li>The specific URL on our site where the link is located.</li>
          <li>Your contact information (Email/Phone).</li>
          <li>A statement of good faith belief that use is unauthorized.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 border-b border-netflix-gray/20 pb-2">3. Contact</h2>
        <p>
          Send notices to: 
          <span className="text-red-500 ml-2 font-mono bg-black/30 px-2 py-1 rounded">
            pabsvt2015@gmail.com
          </span>
        </p>
      </section>
    </div>
  );
}