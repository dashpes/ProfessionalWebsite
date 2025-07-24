"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Code, Database, BarChart, LayoutDashboard } from "lucide-react"
import { useState, useEffect, useRef, useMemo } from "react"

export default function SkillsSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const [titleVisible, setTitleVisible] = useState(false)

  const skills = useMemo(() => [
    {
      icon: <Code className="h-8 w-8 text-purple-500" />,
      title: "Full Stack Development",
      description: "Proficient in building robust and scalable web applications from front-end to back-end.",
      details: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Radix UI", "Node.js API Routes"],
    },
    {
      icon: <Database className="h-8 w-8 text-purple-500" />,
      title: "Data Analysis & Databases",
      description: "Skilled in data manipulation, analysis, and database management for insightful decision-making.",
      details: ["Python (Pandas, NumPy)", "PostgreSQL with Prisma", "Excel", "Data Cleaning"],
    },
    {
      icon: <BarChart className="h-8 w-8 text-purple-500" />,
      title: "Data Visualization",
      description: "Creating compelling visual representations of data to uncover trends and communicate findings.",
      details: ["Matplotlib", "Seaborn", "Statistical Analysis", "Predictive Modeling"],
    },
    {
      icon: <LayoutDashboard className="h-8 w-8 text-purple-500" />,
      title: "Project Management & Deployment",
      description: "Experience in managing project lifecycles and deploying applications to production environments.",
      details: ["Git", "GitHub", "Vercel", "Next.js Deployment"],
    },
  ], [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // First show the title
            setTitleVisible(true)
            
            // Then animate cards one by one with staggered delays
            skills.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards(prev => [...prev, index])
              }, (index + 1) * 200) // 200ms delay between each card
            })
          } else {
            // Reset when scrolling back up
            setTitleVisible(false)
            setVisibleCards([])
          }
        })
      },
      {
        threshold: 0.2, // Trigger when 20% of the section is visible
        rootMargin: "-50px 0px -50px 0px" // Add some margin to trigger animation earlier
      }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [skills])

  return (
    <section ref={sectionRef} className="container mx-auto px-4 py-16 md:py-24">
      <h2 className={`text-3xl md:text-5xl font-bold text-center mb-12 transition-all duration-1000 ${
        titleVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-8'
      }`}>
        My Expertise
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {skills.map((skill, index) => (
          <Card 
            key={index} 
            className={`bg-gray-900 border-gray-700 text-white transition-all duration-700 ease-out ${
              visibleCards.includes(index)
                ? 'opacity-100 transform translate-x-0 scale-100'
                : 'opacity-0 transform -translate-x-12 scale-95'
            }`}
            style={{ 
              transitionDelay: visibleCards.includes(index) ? '0ms' : `${index * 100}ms` 
            }}
          >
            <CardHeader className="flex flex-col items-center text-center">
              {skill.icon}
              <CardTitle className="mt-4 text-xl">{skill.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-4">{skill.description}</p>
              <ul className="list-disc list-inside text-left inline-block text-gray-400">
                {skill.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
