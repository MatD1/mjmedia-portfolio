'use client';

import { motion } from 'framer-motion';
import { 
  IoCodeSlash, 
  IoGameController, 
  IoRocket, 
  IoStar,
  IoHeart,
  IoCodeWorking,
  IoLaptop,
  IoBulb,
  IoRibbon
} from 'react-icons/io5';

import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Badge from '~/components/ui/Badge';

export default function AboutPage() {
  const skills = [
    { name: 'React/Next.js', level: 95, color: 'var(--neon-cyan)' },
    { name: 'TypeScript', level: 90, color: 'var(--neon-blue)' },
    { name: 'Node.js', level: 85, color: 'var(--neon-green)' },
    { name: 'Python', level: 80, color: 'var(--neon-yellow)' },
    { name: 'PostgreSQL', level: 85, color: 'var(--neon-pink)' },
    { name: 'Docker', level: 75, color: 'var(--neon-orange)' },
  ];

  const achievements = [
    {
      icon: IoRibbon,
      title: 'Full-Stack Developer',
      description: '5+ years building web applications',
      color: 'var(--neon-cyan)'
    },
    {
      icon: IoGameController,
      title: 'Retro Gaming Enthusiast',
      description: 'Passionate about pixel art and 8-bit aesthetics',
      color: 'var(--neon-pink)'
    },
    {
      icon: IoBulb,
      title: 'Innovation Focused',
      description: 'Always exploring new technologies and frameworks',
      color: 'var(--neon-green)'
    },
    {
      icon: IoHeart,
      title: 'Open Source Contributor',
      description: 'Active in the developer community',
      color: 'var(--neon-red)'
    }
  ];

  const timeline = [
    {
      year: '2024',
      title: 'Portfolio Website',
      description: 'Built this retro gaming-themed portfolio with Next.js and TypeScript',
      type: 'project'
    },
    {
      year: '2023',
      title: 'Senior Developer',
      description: 'Led development of multiple web applications and mentored junior developers',
      type: 'work'
    },
    {
      year: '2022',
      title: 'Game Development',
      description: 'Created several retro-style web games using HTML5 Canvas and JavaScript',
      type: 'project'
    },
    {
      year: '2021',
      title: 'Full-Stack Developer',
      description: 'Started focusing on full-stack development with React and Node.js',
      type: 'work'
    },
    {
      year: '2020',
      title: 'First Steps',
      description: 'Began my journey in web development with HTML, CSS, and JavaScript',
      type: 'education'
    }
  ];

  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="relative inline-block mb-8">
            <motion.div
              className="w-32 h-32 bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-pink)] rounded-full mx-auto mb-6 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <IoCodeSlash className="text-6xl text-[var(--bg-primary)]" />
            </motion.div>
            <div className="absolute -top-2 -right-2 text-[var(--neon-yellow)]">
              <IoStar className="text-2xl float" />
            </div>
            <div className="absolute -bottom-2 -left-2 text-[var(--neon-green)]">
              <IoGameController className="text-2xl float" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          <h1 className="pixel-text text-4xl sm:text-5xl lg:text-6xl text-glow mb-6">
            About Me
          </h1>
          
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
            I'm a full-stack developer with a passion for creating digital experiences 
            that blend modern web technologies with retro gaming aesthetics. When I'm not 
            coding, you'll find me exploring pixel art, playing classic games, or 
            experimenting with new frameworks and tools.
          </p>
        </motion.div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="pixel-text text-3xl text-glow text-center mb-12">
            Technical Skills
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="pixel-text text-lg">{skill.name}</span>
                    <span className="text-[var(--text-secondary)]">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-3">
                    <motion.div
                      className="h-3 rounded-full"
                      style={{ backgroundColor: skill.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, delay: 0.5 + 0.1 * index }}
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="pixel-text text-3xl text-glow text-center mb-12">
            What I Do
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="text-center p-6 h-full">
                  <achievement.icon 
                    className="text-4xl mx-auto mb-4" 
                    style={{ color: achievement.color }}
                  />
                  <h3 className="pixel-text text-lg text-glow mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    {achievement.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="pixel-text text-3xl text-glow text-center mb-12">
            My Journey
          </h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--neon-cyan)] to-[var(--neon-pink)]"></div>
            
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="relative flex items-start gap-6"
                >
                  {/* Timeline Dot */}
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-[var(--bg-primary)] flex-shrink-0 mt-2"
                    style={{ 
                      backgroundColor: item.type === 'work' ? 'var(--neon-cyan)' : 
                                     item.type === 'project' ? 'var(--neon-green)' : 
                                     'var(--neon-pink)'
                    }}
                  />
                  
                  {/* Content */}
                  <Card className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <Badge 
                        variant={item.type === 'work' ? 'info' : 
                                item.type === 'project' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {item.type}
                      </Badge>
                      <span className="pixel-text text-lg text-glow">{item.year}</span>
                    </div>
                    <h3 className="pixel-text text-xl text-glow mb-2">{item.title}</h3>
                    <p className="text-[var(--text-secondary)]">{item.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Card className="p-12">
            <h2 className="pixel-text text-3xl text-glow mb-6">
              Let's Work Together
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
              I'm always interested in new opportunities and exciting projects. 
              Whether you have a project in mind or just want to chat about technology, 
              I'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <IoLaptop className="mr-2" />
                View My Work
              </Button>
              <Button variant="secondary" size="lg">
                <IoRocket className="mr-2" />
                Get In Touch
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
