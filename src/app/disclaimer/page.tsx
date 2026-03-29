export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Disclaimer</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Educational Purpose</h2>
            <p>
              This website is created for educational and personal use only. It demonstrates 
              web development skills using Next.js, React, and various APIs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Content Disclaimer</h2>
            <p>
              We do not host, upload, or store any video content on our servers. All streaming 
              content is embedded from third-party sources. We have no control over the content 
              provided by these third-party websites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Copyright</h2>
            <p>
              All content, including but not limited to movies, TV shows, and anime, are the 
              property of their respective copyright holders. We respect intellectual property 
              rights and do not claim ownership of any content displayed on this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">DMCA</h2>
            <p>
              If you are a copyright owner and believe that content on this site infringes 
              your copyright, please contact the third-party hosting services directly. 
              Since we do not host any content, we cannot remove it from our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Data Sources</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Movie/TV data: The Movie Database (TMDB)</li>
              <li>Anime data: Jikan API (MyAnimeList)</li>
              <li>Anime IDs: AniList API</li>
              <li>Streaming embeds: Third-party services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">User Responsibility</h2>
            <p>
              Users are responsible for ensuring their use of this website complies with 
              local laws and regulations. We do not encourage or condone copyright infringement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">No Warranties</h2>
            <p>
              This website is provided "as is" without any warranties, express or implied. 
              We do not guarantee the accuracy, completeness, or availability of any content.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </main>
  );
}
