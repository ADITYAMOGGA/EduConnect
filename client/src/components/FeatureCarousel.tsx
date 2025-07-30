import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users, BookOpen, Award, FileText, BarChart3, Settings, Sparkles, MessageSquare } from 'lucide-react';

const features = [
  {
    id: 1,
    title: 'Student Management',
    description: 'Effortlessly manage student records, import data via CSV, and organize by classes. Keep track of admission numbers, contact details, and academic information.',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9InVybCgjZ3JhZGllbnQxKSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMzMxNkY5O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzA2QjZENDtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBkPSJNNTAgMTAwaDMwMHYxMDBINTB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHJ4PSI4Ii8+PHRleHQgeD0iMjAwIiB5PSIxNDAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE4cHgiIGZvbnQtZmFtaWx5PSJBcmlhbCI+U3R1ZGVudCBNYW5hZ2VtZW50PC90ZXh0Pjwvc3ZnPg=='
  },
  {
    id: 2,
    title: 'Excel-Style Marks Entry',
    description: 'Revolutionary spreadsheet interface for entering marks. Inline editing, automatic grade calculations, and real-time validation make marking efficient and accurate.',
    icon: BookOpen,
    gradient: 'from-purple-500 to-pink-500',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9InVybCgjZ3JhZGllbnQyKSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOEI1Q0Y2O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0VDNDg5OTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBkPSJNNTAgNjBoMzAwdjEyMEg1MHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgcng9IjgiLz48dGV4dCB4PSIyMDAiIHk9IjEzMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMThweCIgZm9udC1mYW1pbHk9IkFyaWFsIj5FeGNlbC1TdHlsZSBNYXJrcyBFbnRyeTwvdGV4dD48L3N2Zz4='
  },
  {
    id: 3,
    title: 'AI-Powered Assistant',
    description: 'Chat with our intelligent AI to get insights about student performance, generate reports, and get answers about your school data in natural language.',
    icon: MessageSquare,
    gradient: 'from-emerald-500 to-teal-500',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9InVybCgjZ3JhZGllbnQzKSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMTA5OTgxO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzEzOUY5NDtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBkPSJNNTAgODBoMzAwdjgwSDUweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiByeD0iOCIvPjx0ZXh0IHg9IjIwMCIgeT0iMTMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxOHB4IiBmb250LWZhbWlseT0iQXJpYWwiPkFJLVBvd2VyZWQgQXNzaXN0YW50PC90ZXh0Pjwvc3ZnPg=='
  },
  {
    id: 4,
    title: 'Professional Certificates',
    description: 'Generate beautiful, customizable progress certificates with school branding. High-quality PDF output with detailed grade tables and professional layouts.',
    icon: Award,
    gradient: 'from-orange-500 to-red-500',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9InVybCgjZ3JhZGllbnQ0KSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQ0IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRjk3MzE2O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0VGNDQ0NDtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBkPSJNNTAgNzBoMzAwdjEwMEg1MHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgcng9IjgiLz48dGV4dCB4PSIyMDAiIHk9IjEzMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMThweCIgZm9udC1mYW1pbHk9IkFyaWFsIj5Qcm9mZXNzaW9uYWwgQ2VydGlmaWNhdGVzPC90ZXh0Pjwvc3ZnPg=='
  },
  {
    id: 5,
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboard with performance insights, class comparisons, and trend analysis. Visual charts and graphs make data interpretation easy.',
    icon: BarChart3,
    gradient: 'from-violet-500 to-purple-500',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9InVybCgjZ3JhZGllbnQ1KSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQ1IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOEI1Q0Y2O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0E4NTVGNztzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBkPSJNNTAgOTBoMzAwdjYwSDUweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiByeD0iOCIvPjx0ZXh0IHg9IjIwMCIgeT0iMTMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxOHB4IiBmb250LWZhbWlseT0iQXJpYWwiPkFkdmFuY2VkIEFuYWx5dGljczwvdGV4dD48L3N2Zz4='
  },
  {
    id: 6,
    title: 'Data Import & Export',
    description: 'Seamlessly import student data from CSV files and export comprehensive reports. Bulk operations make managing large datasets effortless.',
    icon: FileText,
    gradient: 'from-indigo-500 to-blue-500',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9InVybCgjZ3JhZGllbnQ2KSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQ2IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM2NkYxO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzNCODJGNjtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBkPSJNNTAgNzBoMzAwdjEwMEg1MHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgcng9IjgiLz48dGV4dCB4PSIyMDAiIHk9IjEzMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMThweCIgZm9udC1mYW1pbHk9IkFyaWFsIj5EYXRhIEltcG9ydCAmIEV4cG9ydDwvdGV4dD48L3N2Zz4='
  }
];

export function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Main Carousel */}
      <div className="relative h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Card className="h-full border-0 shadow-none bg-transparent">
              <div className="h-full flex">
                {/* Content Side */}
                <div className="flex-1 p-8 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r ${features[currentIndex].gradient} text-white`}>
                      {React.createElement(features[currentIndex].icon, { className: "w-5 h-5" })}
                      <span className="font-medium">Feature {currentIndex + 1}</span>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {features[currentIndex].title}
                    </h3>
                    
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                      {features[currentIndex].description}
                    </p>
                    
                    <div className="pt-4">
                      <Button 
                        className={`bg-gradient-to-r ${features[currentIndex].gradient} hover:opacity-90 text-white shadow-lg`}
                      >
                        Learn More
                      </Button>
                    </div>
                  </motion.div>
                </div>

                {/* Image Side */}
                <div className="flex-1 relative overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="h-full w-full relative"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${features[currentIndex].gradient} opacity-20`} />
                    <img
                      src={features[currentIndex].image}
                      alt={features[currentIndex].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-lg backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-lg backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? `bg-gradient-to-r ${features[currentIndex].gradient} shadow-lg`
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="flex justify-center mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {isAutoPlaying ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Auto-playing
            </>
          ) : (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Manual control
            </>
          )}
        </Button>
      </div>
    </div>
  );
}