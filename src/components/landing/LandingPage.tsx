"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Leaf, Globe, Calculator, BookOpen, Users, TrendingUp, Play, ArrowRight, Zap, Heart, Shield, Menu, X } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const heroSlides = [
    {
      title: "探索数字生态世界",
      subtitle: "通过互动游戏体验生态平衡的奥秘，成为环保行动者",
      image: "🌱",
      stats: { label: "CO₂浓度", value: "430 ppm", trend: "↑" }
    },
    {
      title: "科学严谨的环保教育",
      subtitle: "基于真实生态学原理，让复杂的环境科学变得有趣易懂",
      image: "🔬",
      stats: { label: "全球温度", value: "+1.2°C", trend: "↑" }
    },
    {
      title: "从认知到行动",
      subtitle: "不仅学习环保知识，更要付诸实际行动，共建可持续未来",
      image: "🌍",
      stats: { label: "用户参与", value: "10,000+", trend: "↑" }
    }
  ]

  const features = [
    {
      icon: <Play className="w-8 h-8" />,
      title: "互动生态模拟器",
      description: "体验真实的生态系统动态平衡，观察→干预→见证→修复的完整循环",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "环保数据可视化",
      description: "实时了解全球环境变化趋势，用数据说话，用科学决策",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: "碳足迹计算器",
      description: "计算你的个人碳排放量，获得科学的减排建议和行动计划",
      color: "from-purple-500 to-violet-600",
      link: "/calculator"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "科学知识库",
      description: "学习环保科学，掌握专业知识，成为环保领域的专家",
      color: "from-orange-500 to-red-600"
    }
  ]

  const stats = [
    { icon: <Users className="w-6 h-6" />, label: "活跃用户", value: "12,000+", description: "来自全球的环保践行者" },
    { icon: <Leaf className="w-6 h-6" />, label: "减少碳排放", value: "500吨", description: "通过行动指导实现" },
    { icon: <Globe className="w-6 h-6" />, label: "覆盖地区", value: "50+", description: "国家和地区" },
    { icon: <Heart className="w-6 h-6" />, label: "环保项目", value: "100+", description: "支持的环保倡议" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="text-2xl">🌱</div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                我的数字生态圈
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">功能特色</a>
              <a href="#mission" className="text-gray-600 hover:text-green-600 transition-colors">项目使命</a>
              <Link href="/calculator" className="text-gray-600 hover:text-green-600 transition-colors">
                碳足迹计算器
              </Link>
              <Link href="/game">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                  <Play className="w-4 h-4 mr-2" />
                  开始游戏
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">功能特色</a>
                <a href="#mission" className="text-gray-600 hover:text-green-600 transition-colors">项目使命</a>
                <Link href="/calculator" className="text-gray-600 hover:text-green-600 transition-colors">
                  碳足迹计算器
                </Link>
                <Link href="/game">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white w-full">
                    <Play className="w-4 h-4 mr-2" />
                    开始游戏
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.3),transparent_50%)]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-8xl mb-6 animate-bounce">
                {heroSlides[currentSlide].image}
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
                {heroSlides[currentSlide].title}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                {heroSlides[currentSlide].subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/game">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    开始生态探索之旅
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  了解更多
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Real-time Stats */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">实时数据</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {heroSlides[currentSlide].stats.label}: {heroSlides[currentSlide].stats.value}
                  </div>
                  <div className="text-red-500 font-semibold">
                    {heroSlides[currentSlide].stats.trend}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-green-600 w-8' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              核心功能特色
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              集游戏化学习、科学严谨性和实际行动于一体的综合环保平台
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const CardComponent = (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50 cursor-pointer">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )

              return feature.link ? (
                <Link key={index} href={feature.link}>
                  {CardComponent}
                </Link>
              ) : CardComponent
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              我们的影响力
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              数字见证我们共同的环保成果
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold mb-1">
                  {stat.label}
                </div>
                <div className="text-sm opacity-80">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
                  我们的使命
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  通过创新的游戏化教育方式，让每个人都能理解环保科学，参与环保行动，共同构建可持续发展的美好未来。
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">寓教于乐</h3>
                      <p className="text-gray-600">将复杂的环保科学转化为有趣的互动体验</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">科学严谨</h3>
                      <p className="text-gray-600">基于真实的生态学原理和环境数据</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Heart className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">行动导向</h3>
                      <p className="text-gray-600">从认知到行动，推动实际的环保改变</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl p-8 text-white shadow-2xl">
                  <div className="text-6xl mb-6 text-center">🌱</div>
                  <h3 className="text-2xl font-bold mb-4 text-center">My Digital Biome</h3>
                  <p className="text-center opacity-90 mb-6">
                    体验完整的生态系统模拟，从观察到修复的四阶段环保之旅
                  </p>
                  <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-sm">
                      <span>观察 → 干预 → 见证 → 修复</span>
                      <span className="bg-white/30 px-3 py-1 rounded-full">MVP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              准备好开始你的
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                环保之旅
              </span>
              了吗？
            </h2>

            <p className="text-xl md:text-2xl opacity-90 mb-12 leading-relaxed">
              加入我们，通过科学、游戏和行动，共同守护地球家园
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/game">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  <Play className="w-6 h-6 mr-3" />
                  立即开始探索
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/30 text-white hover:bg-white hover:text-gray-900 px-12 py-6 text-xl font-bold rounded-full backdrop-blur-sm transition-all duration-300"
                onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })}
              >
                了解项目详情
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </div>

            <div className="mt-12 text-sm opacity-70">
              <p>🌍 已有 12,000+ 用户加入我们的环保行动</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              My Digital Biome
            </div>
            <p className="text-gray-400 mb-6">
              游戏驱动的环保教育门户网站
            </p>
            <div className="flex justify-center gap-8 text-sm text-gray-400">
              <span>© 2024 My Digital Biome</span>
              <span>•</span>
              <span>寓教于乐 • 科学严谨 • 行动导向</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
