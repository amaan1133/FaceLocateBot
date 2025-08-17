const mockVideos = [
  {
    id: 1,
    title: "Amazing Mountain Sunset Timelapse 4K",
    channel: "Nature Timelapses",
    channelInitials: "NT",
    views: "2.3M views",
    time: "3 days ago",
    duration: "12:34",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: 2,
    title: "Night Photography in Tokyo Streets",
    channel: "City Vibes", 
    channelInitials: "CV",
    views: "856K views",
    time: "1 week ago",
    duration: "8:22",
    thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: 3,
    title: "Relaxing Ocean Sounds for Study & Sleep",
    channel: "Ocean Sounds",
    channelInitials: "OS", 
    views: "4.1M views",
    time: "2 months ago",
    duration: "15:47",
    thumbnail: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    gradient: "from-teal-500 to-green-500"
  },
  {
    id: 4,
    title: "Coffee Shop Jazz - Chill Study Music",
    channel: "Café Sounds",
    channelInitials: "CS",
    views: "1.8M views", 
    time: "5 days ago",
    duration: "45:12",
    thumbnail: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    gradient: "from-amber-500 to-orange-500"
  },
  {
    id: 5,
    title: "Forest Walk - Nature Meditation",
    channel: "Forest Walks",
    channelInitials: "FW",
    views: "632K views",
    time: "1 day ago", 
    duration: "22:15",
    thumbnail: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    gradient: "from-green-600 to-emerald-500"
  },
  {
    id: 6,
    title: "Modern Architecture Photography Tips",
    channel: "Architecture Daily",
    channelInitials: "AD",
    views: "324K views",
    time: "4 days ago",
    duration: "6:33", 
    thumbnail: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    gradient: "from-gray-600 to-slate-500"
  },
  {
    id: 7,
    title: "Sahara Desert Adventure Documentary", 
    channel: "Desert Voyager",
    channelInitials: "DV",
    views: "1.2M views",
    time: "6 days ago",
    duration: "18:44",
    thumbnail: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450", 
    gradient: "from-yellow-600 to-red-500"
  },
  {
    id: 8,
    title: "Alpine Mountain Peak Climbing Guide",
    channel: "Mountain Pro", 
    channelInitials: "MP",
    views: "892K views",
    time: "2 weeks ago",
    duration: "28:17",
    thumbnail: "https://images.unsplash.com/photo-1464822759844-d150baec3482?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    gradient: "from-blue-600 to-indigo-500"
  }
];

export function VideoGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {mockVideos.map((video) => (
        <div key={video.id} className="bg-youtube-secondary rounded-xl overflow-hidden hover:bg-youtube-elevated transition-colors cursor-pointer group">
          <div className="relative aspect-video">
            <img 
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 rounded text-xs font-semibold">
              {video.duration}
            </div>
          </div>
          <div className="p-3">
            <div className="flex space-x-3">
              <div className={`w-9 h-9 bg-gradient-to-br ${video.gradient} rounded-full flex-shrink-0 flex items-center justify-center`}>
                <span className="text-sm font-semibold">{video.channelInitials}</span>
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-gray-200 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{video.channel}</p>
                <p className="text-sm text-gray-400">{video.views} • {video.time}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
