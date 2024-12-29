import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../auth/firebase';

interface Project {
    id: string;
    'titre-projet': string;
    'date-creation': string;
}

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [projects, setProjects] = useState<Project[]>([])

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const projectsCollection = collection(db, 'projets')
            const projectSnapshot = await getDocs(projectsCollection)
            const projectList = projectSnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            })) as Project[]
            setProjects(projectList)
        } catch (error) {
            console.error("Error fetching projects: ", error)
        }
    }

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)

    const startingDayIndex = monthStart.getDay()
    const endingDayIndex = monthEnd.getDay()

    const allDays = eachDayOfInterval({
        start: monthStart,
        end: monthEnd
    })

    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prevDate => direction === 'prev' ? subMonths(prevDate, 1) : addMonths(prevDate, 1))
    }

    const goToToday = () => setCurrentDate(new Date())

    const getProjectsForDate = (date: Date) => {
        return projects.filter(project => isSameDay(parseISO(project['date-creation']), date))
    }

    const isToday = (date: Date) => isSameDay(date, new Date())

    return (
        <div className="w-full max-w-full mx-auto p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                <h2 className="text-xl font-semibold mb-2 sm:mb-0">
                    {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </h2>
                <div className="flex items-center space-x-2">
                    <button onClick={() => navigateMonth('prev')} className="p-1 rounded hover:bg-gray-200">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={goToToday} className="px-2 py-1 text-sm rounded hover:bg-gray-200">
                        Aujourd'hui
                    </button>
                    <button onClick={() => navigateMonth('next')} className="p-1 rounded hover:bg-gray-200">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 bg-gray-100 rounded-lg p-2">
                {weekDays.map(day => (
                    <div key={day} className="bg-white p-2 text-sm font-semibold text-gray-600 text-center rounded">
                        {day}
                    </div>
                ))}
                {Array.from({ length: startingDayIndex }).map((_, index) => (
                    <div key={`prev-${index}`} className="bg-white p-2 min-h-[60px] sm:min-h-[100px] rounded"></div>
                ))}
                {allDays.map((day, index) => {
                    const dayProjects = getProjectsForDate(day)
                    return (
                        <div
                            key={index}
                            className="bg-white p-2 min-h-[60px] sm:min-h-[100px] rounded shadow-sm hover:shadow-md transition-shadow duration-200 relative"
                        >
                            <div className={`font-medium mb-1 ${isToday(day) ? 'w-7 h-7 flex items-center justify-center rounded-full bg-blue-500 text-white absolute top-1 left-1' : ''}`}>
                                {format(day, 'd')}
                            </div>
                            <div className="space-y-1 mt-6">
                                {dayProjects.map(project => (
                                    <div
                                        key={project.id}
                                        className="text-xs bg-purple-100 text-purple-700 p-1 rounded truncate"
                                    >
                                        {project['titre-projet']}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
                {Array.from({ length: 6 - endingDayIndex }).map((_, index) => (
                    <div key={`next-${index}`} className="bg-white p-2 min-h-[60px] sm:min-h-[100px] rounded"></div>
                ))}
            </div>
        </div>
    )
}
