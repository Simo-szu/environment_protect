"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calculator, Car, Home, Utensils, Plane, Lightbulb, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CarbonCalculator from '@/components/calculator/CarbonCalculator'

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-gray-600 hover:text-green-600 transition-colors">返回首页</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <Calculator className="w-6 h-6 text-green-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                碳足迹计算器
              </span>
            </div>
            
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="text-6xl mb-6">🌱</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              计算你的碳足迹
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              了解你的日常活动对环境的影响，获得个性化的减排建议
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Car className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm text-green-100">交通出行</div>
                <div className="text-lg font-bold">40%</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Home className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm text-green-100">家庭能源</div>
                <div className="text-lg font-bold">30%</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Utensils className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm text-green-100">饮食习惯</div>
                <div className="text-lg font-bold">20%</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Plane className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm text-green-100">航空旅行</div>
                <div className="text-lg font-bold">10%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                开始计算你的碳足迹
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                通过回答几个简单问题，我们将帮你计算年度碳排放量，并提供个性化的减排建议
              </p>
            </div>

            {/* Calculator Component */}
            <CarbonCalculator />
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              为什么要计算碳足迹？
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <CardTitle>提高意识</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    了解你的日常活动如何影响环境，培养环保意识
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <Calculator className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <CardTitle>科学量化</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    基于科学数据精确计算，让环保行动有据可依
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <Droplets className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <CardTitle>行动指导</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    获得个性化减排建议，从小事做起保护地球
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
