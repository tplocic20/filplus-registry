import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { type Application } from '@/type'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

interface ProjectInfoCardProps {
  application: Application
}

const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({ application }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const project = application.Project
  const { 'Project Id': projectId, ...projectDetails } = project

  const getRowStyles = (index: number): string => {
    return index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
  }

  const toggleExpanded = (): void => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight mb-6">
        Project Information
      </h2>
      <Card className="bg-gray-50 p-4 rounded-lg shadow-md">
        <CardHeader
          className="border-b pb-2 mb-4 flex flex-row justify-between items-center cursor-pointer"
          onClick={toggleExpanded}
        >
          <h2 className="text-xl font-bold">{projectId as string}</h2>
          <div>{isExpanded ? <FaChevronUp /> : <FaChevronDown />}</div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="grid text-sm">
            {Object.entries(projectDetails).map(([key, value], idx) => {
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
              const rowStyles = getRowStyles(idx)

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 ${rowStyles}`}
                >
                  <p className="text-gray-600">{label}</p>
                  <p className="font-medium text-gray-800">{value as string}</p>
                </div>
              )
            })}
          </CardContent>
        )}
      </Card>
    </>
  )
}

export default ProjectInfoCard
