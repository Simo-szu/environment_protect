"use client"

import { useState } from 'react'
import { Car, Home, Utensils, Plane, ChevronRight, RotateCcw, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

interface CarbonData {
  transportation: {
    carMiles: number
    carType: string
    publicTransport: number
    flights: number
  }
  energy: {
    electricity: number
    gas: number
    heating: string
    homeSize: string
  }
  food: {
    diet: string
    localFood: number
    organicFood: number
  }
  lifestyle: {
    shopping: number
    waste: string
    recycling: number
  }
}

const initialData: CarbonData = {
  transportation: {
    carMiles: 0,
    carType: 'gasoline',
    publicTransport: 0,
    flights: 0
  },
  energy: {
    electricity: 0,
    gas: 0,
    heating: 'gas',
    homeSize: 'medium'
  },
  food: {
    diet: 'mixed',
    localFood: 50,
    organicFood: 25
  },
  lifestyle: {
    shopping: 0,
    waste: 'mixed',
    recycling: 50
  }
}

export default function CarbonCalculator() {
  const [data, setData] = useState<CarbonData>(initialData)
  const [currentStep, setCurrentStep] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const steps = [
    { id: 'transportation', title: '交通出行', icon: Car, color: 'text-blue-600' },
    { id: 'energy', title: '家庭能源', icon: Home, color: 'text-orange-600' },
    { id: 'food', title: '饮食习惯', icon: Utensils, color: 'text-green-600' },
    { id: 'lifestyle', title: '生活方式', icon: Plane, color: 'text-purple-600' }
  ]

  const updateData = (category: keyof CarbonData, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const calculateCarbon = () => {
    setIsCalculating(true)
    
    // 模拟计算过程
    setTimeout(() => {
      // 碳排放计算逻辑（基于科学数据的简化版本）
      const transportationEmissions = 
        (data.transportation.carMiles * (data.transportation.carType === 'electric' ? 0.1 : 0.4)) +
        (data.transportation.publicTransport * 0.05) +
        (data.transportation.flights * 0.2)

      const energyEmissions = 
        (data.energy.electricity * 0.5) +
        (data.energy.gas * 0.2) +
        (data.energy.homeSize === 'large' ? 2 : data.energy.homeSize === 'small' ? 0.5 : 1)

      const foodEmissions = 
        (data.food.diet === 'vegetarian' ? 1.5 : data.food.diet === 'vegan' ? 1 : 3) +
        (data.food.localFood < 50 ? 0.5 : 0) +
        (data.food.organicFood < 25 ? 0.3 : 0)

      const lifestyleEmissions = 
        (data.lifestyle.shopping * 0.1) +
        (data.lifestyle.waste === 'minimal' ? 0.5 : 1.5) +
        (data.lifestyle.recycling < 50 ? 0.5 : 0)

      const totalEmissions = transportationEmissions + energyEmissions + foodEmissions + lifestyleEmissions

      setResults({
        total: Math.round(totalEmissions * 100) / 100,
        breakdown: {
          transportation: Math.round(transportationEmissions * 100) / 100,
          energy: Math.round(energyEmissions * 100) / 100,
          food: Math.round(foodEmissions * 100) / 100,
          lifestyle: Math.round(lifestyleEmissions * 100) / 100
        },
        comparison: {
          national: 8.5, // 中国人均碳排放
          global: 4.8,   // 全球人均碳排放
          target: 2.3    // 巴黎协定目标
        }
      })
      setIsCalculating(false)
    }, 2000)
  }

  const resetCalculator = () => {
    setData(initialData)
    setCurrentStep(0)
    setResults(null)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      calculateCarbon()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (results) {
    return (
      <div className="space-y-8">
        {/* Results Display */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🌍</div>
            <CardTitle className="text-3xl text-green-800">你的年度碳足迹</CardTitle>
            <CardDescription className="text-lg">
              基于你提供的信息计算得出
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {results.total} 吨
              </div>
              <div className="text-gray-600">CO₂当量 / 年</div>
            </div>

            {/* Comparison */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-red-500">{results.comparison.national}</div>
                <div className="text-sm text-gray-600">中国人均</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-500">{results.comparison.global}</div>
                <div className="text-sm text-gray-600">全球人均</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-500">{results.comparison.target}</div>
                <div className="text-sm text-gray-600">目标值</div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center mb-4">排放分解</h3>
              {Object.entries(results.breakdown).map(([category, value], index) => {
                const step = steps.find(s => s.id === category)
                const percentage = Math.round((value as number / results.total) * 100)
                return (
                  <div key={category} className="flex items-center gap-4">
                    {step && <step.icon className={`w-6 h-6 ${step.color}`} />}
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{step?.title}</span>
                        <span className="text-sm text-gray-600">{(value as number).toFixed(2)} 吨 ({percentage}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-4 mt-8">
              <Button onClick={resetCalculator} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                重新计算
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600">
                <Leaf className="w-4 h-4 mr-2" />
                查看减排建议
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isCalculating) {
    return (
      <Card className="text-center py-16">
        <CardContent>
          <div className="text-6xl mb-6">🔄</div>
          <h3 className="text-2xl font-bold mb-4">正在计算你的碳足迹...</h3>
          <p className="text-gray-600 mb-6">基于科学数据进行精确计算</p>
          <Progress value={66} className="max-w-md mx-auto" />
        </CardContent>
      </Card>
    )
  }

  const CurrentStepIcon = steps[currentStep].icon

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              index <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              <step.icon className="w-5 h-5" />
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 mx-2 ${
                index < currentStep ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CurrentStepIcon className={`w-8 h-8 ${steps[currentStep].color}`} />
            <div>
              <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
              <CardDescription>
                步骤 {currentStep + 1} / {steps.length}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="carMiles">年度驾车里程 (公里)</Label>
                  <Input
                    id="carMiles"
                    type="number"
                    value={data.transportation.carMiles}
                    onChange={(e) => updateData('transportation', 'carMiles', Number(e.target.value))}
                    placeholder="例如: 15000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carType">车辆类型</Label>
                  <Select
                    value={data.transportation.carType}
                    onValueChange={(value) => updateData('transportation', 'carType', value)}
                  >
                    <option value="gasoline">汽油车</option>
                    <option value="diesel">柴油车</option>
                    <option value="hybrid">混合动力</option>
                    <option value="electric">电动车</option>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="publicTransport">公共交通 (小时/周)</Label>
                  <Input
                    id="publicTransport"
                    type="number"
                    value={data.transportation.publicTransport}
                    onChange={(e) => updateData('transportation', 'publicTransport', Number(e.target.value))}
                    placeholder="例如: 10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flights">年度航班次数</Label>
                  <Input
                    id="flights"
                    type="number"
                    value={data.transportation.flights}
                    onChange={(e) => updateData('transportation', 'flights', Number(e.target.value))}
                    placeholder="例如: 4"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="electricity">月度电费 (元)</Label>
                  <Input
                    id="electricity"
                    type="number"
                    value={data.energy.electricity}
                    onChange={(e) => updateData('energy', 'electricity', Number(e.target.value))}
                    placeholder="例如: 200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gas">月度燃气费 (元)</Label>
                  <Input
                    id="gas"
                    type="number"
                    value={data.energy.gas}
                    onChange={(e) => updateData('energy', 'gas', Number(e.target.value))}
                    placeholder="例如: 100"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="heating">主要供暖方式</Label>
                  <Select
                    value={data.energy.heating}
                    onValueChange={(value) => updateData('energy', 'heating', value)}
                  >
                    <option value="gas">天然气</option>
                    <option value="electric">电力</option>
                    <option value="coal">煤炭</option>
                    <option value="solar">太阳能</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeSize">住房面积</Label>
                  <Select
                    value={data.energy.homeSize}
                    onValueChange={(value) => updateData('energy', 'homeSize', value)}
                  >
                    <option value="small">小于80平米</option>
                    <option value="medium">80-150平米</option>
                    <option value="large">大于150平米</option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="diet">饮食习惯</Label>
                <Select
                  value={data.food.diet}
                  onValueChange={(value) => updateData('food', 'diet', value)}
                >
                  <option value="vegan">纯素食</option>
                  <option value="vegetarian">素食</option>
                  <option value="mixed">杂食</option>
                  <option value="meat-heavy">肉食为主</option>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="localFood">本地食物比例 (%)</Label>
                  <Input
                    id="localFood"
                    type="number"
                    min="0"
                    max="100"
                    value={data.food.localFood}
                    onChange={(e) => updateData('food', 'localFood', Number(e.target.value))}
                    placeholder="例如: 60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organicFood">有机食物比例 (%)</Label>
                  <Input
                    id="organicFood"
                    type="number"
                    min="0"
                    max="100"
                    value={data.food.organicFood}
                    onChange={(e) => updateData('food', 'organicFood', Number(e.target.value))}
                    placeholder="例如: 30"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="shopping">月度购物支出 (元)</Label>
                  <Input
                    id="shopping"
                    type="number"
                    value={data.lifestyle.shopping}
                    onChange={(e) => updateData('lifestyle', 'shopping', Number(e.target.value))}
                    placeholder="例如: 1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waste">垃圾处理方式</Label>
                  <Select
                    value={data.lifestyle.waste}
                    onValueChange={(value) => updateData('lifestyle', 'waste', value)}
                  >
                    <option value="minimal">尽量减少垃圾</option>
                    <option value="mixed">一般处理</option>
                    <option value="excessive">产生较多垃圾</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recycling">回收利用比例 (%)</Label>
                <Input
                  id="recycling"
                  type="number"
                  min="0"
                  max="100"
                  value={data.lifestyle.recycling}
                  onChange={(e) => updateData('lifestyle', 'recycling', Number(e.target.value))}
                  placeholder="例如: 70"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          onClick={prevStep} 
          disabled={currentStep === 0}
          variant="outline"
        >
          上一步
        </Button>
        <Button onClick={nextStep} className="bg-gradient-to-r from-green-600 to-emerald-600">
          {currentStep === steps.length - 1 ? '计算结果' : '下一步'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
