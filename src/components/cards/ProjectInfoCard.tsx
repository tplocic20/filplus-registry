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
      <Card className="bg-gray-50 p-4 rounded-lg shadow-md select-none">
        <CardHeader
          className={`${
            isExpanded ? 'border-b' : ''
          } pb-2 mb-4 flex flex-row justify-between items-center cursor-pointer`}
          onClick={toggleExpanded}
        >
          <h2 className="text-xl font-bold">Project Information</h2>
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
                  <div className="w-2/3">
                    <p className="text-gray-600">{label}</p>
                  </div>
                  <div className="flex w-1/3 justify-end">
                    <p className="font-medium text-gray-800 text-right">
                      {value as string}
                    </p>
                  </div>
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
