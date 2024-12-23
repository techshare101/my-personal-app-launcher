import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tooltip,
  Modal,
  Chip,
  Button,
  IconButton,
  Link,
  Stack,
  Tabs,
  Tab,
  Fade,
  TextField,
  InputAdornment,
  styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import GitHubIcon from '@mui/icons-material/GitHub';
import SearchIcon from '@mui/icons-material/Search';
import { useDebounce } from 'use-debounce';

const categories = [
  'All',
  'Frontend',
  'Backend',
  'Mobile',
  'Cloud',
  'DevOps',
  'Database',
  'AI/ML',
  'Language',
  'Tool',
  'Security',
  'Testing',
];

const technologies = [
  // Frontend
  { 
    name: 'React',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg',
    category: 'Frontend',
    description: 'A JavaScript library for building user interfaces with a declarative and component-based approach.',
    website: 'https://reactjs.org',
    github: 'https://github.com/facebook/react',
    tags: ['UI', 'JavaScript', 'Component-Based']
  },
  { 
    name: 'Vue',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/vuejs/vuejs-original.svg',
    category: 'Frontend',
    description: 'A progressive and flexible JavaScript framework for building web applications.',
    website: 'https://vuejs.org',
    github: 'https://github.com/vuejs/vue',
    tags: ['UI', 'JavaScript', 'Progressive']
  },
  { 
    name: 'Angular',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/angularjs/angularjs-original.svg',
    category: 'Frontend',
    description: 'A TypeScript-based open-source web application framework.',
    website: 'https://angular.io',
    github: 'https://github.com/angular/angular',
    tags: ['UI', 'TypeScript', 'Opinionated']
  },
  { 
    name: 'Next.js',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg',
    category: 'Frontend',
    description: 'A popular React-based framework for building server-rendered and statically generated websites.',
    website: 'https://nextjs.org',
    github: 'https://github.com/vercel/next.js',
    tags: ['UI', 'React', 'Server-Side Rendering']
  },
  { 
    name: 'Svelte',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/svelte/svelte-original.svg',
    category: 'Frontend',
    description: 'A lightweight JavaScript framework for building web applications.',
    website: 'https://svelte.dev',
    github: 'https://github.com/sveltejs/svelte',
    tags: ['UI', 'JavaScript', 'Lightweight']
  },
  
  // Backend
  { 
    name: 'Python',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg',
    category: 'Backend',
    description: 'A high-level, interpreted programming language for building server-side applications.',
    website: 'https://www.python.org',
    github: 'https://github.com/python/cpython',
    tags: ['Server-Side', 'Interpreted', 'High-Level']
  },
  { 
    name: 'Go',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/go/go-original.svg',
    category: 'Backend',
    description: 'A statically typed, compiled language for building scalable and concurrent systems.',
    website: 'https://golang.org',
    github: 'https://github.com/golang/go',
    tags: ['Server-Side', 'Compiled', 'Statically Typed']
  },
  { 
    name: 'Ruby',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/ruby/ruby-original.svg',
    category: 'Backend',
    description: 'A dynamic, interpreted language for building server-side applications.',
    website: 'https://www.ruby-lang.org',
    github: 'https://github.com/ruby/ruby',
    tags: ['Server-Side', 'Interpreted', 'Dynamic']
  },
  { 
    name: 'Java',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg',
    category: 'Backend',
    description: 'An object-oriented, compiled language for building server-side applications.',
    website: 'https://www.java.com',
    github: 'https://github.com/openjdk/jdk',
    tags: ['Server-Side', 'Compiled', 'Object-Oriented']
  },
  
  // Cloud & DevOps
  { 
    name: 'AWS',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/amazonwebservices/amazonwebservices-original.svg',
    category: 'Cloud',
    description: 'A comprehensive cloud computing platform for building scalable and secure applications.',
    website: 'https://aws.amazon.com',
    github: 'https://github.com/aws',
    tags: ['Cloud', 'Scalable', 'Secure']
  },
  { 
    name: 'Google Cloud',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/googlecloud/googlecloud-original.svg',
    category: 'Cloud',
    description: 'A suite of cloud computing services for building scalable and secure applications.',
    website: 'https://cloud.google.com',
    github: 'https://github.com/googlecloudplatform',
    tags: ['Cloud', 'Scalable', 'Secure']
  },
  { 
    name: 'Azure',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/azure/azure-original.svg',
    category: 'Cloud',
    description: 'A comprehensive cloud computing platform for building scalable and secure applications.',
    website: 'https://azure.microsoft.com',
    github: 'https://github.com/Azure',
    tags: ['Cloud', 'Scalable', 'Secure']
  },
  { 
    name: 'Docker',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg',
    category: 'DevOps',
    description: 'A containerization platform for building, shipping, and running applications.',
    website: 'https://www.docker.com',
    github: 'https://github.com/docker',
    tags: ['Containerization', 'DevOps', 'Scalable']
  },
  { 
    name: 'Kubernetes',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/kubernetes/kubernetes-plain.svg',
    category: 'DevOps',
    description: 'An open-source container orchestration system for automating deployment, scaling, and management.',
    website: 'https://kubernetes.io',
    github: 'https://github.com/kubernetes/kubernetes',
    tags: ['Container Orchestration', 'DevOps', 'Scalable']
  },
  
  // Databases
  { 
    name: 'MongoDB',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg',
    category: 'Database',
    description: 'A NoSQL document-based database for building scalable and flexible data storage solutions.',
    website: 'https://www.mongodb.com',
    github: 'https://github.com/mongodb/mongo',
    tags: ['NoSQL', 'Document-Based', 'Scalable']
  },
  { 
    name: 'PostgreSQL',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg',
    category: 'Database',
    description: 'A powerful, open-source relational database management system.',
    website: 'https://www.postgresql.org',
    github: 'https://github.com/postgres/postgres',
    tags: ['Relational', 'Open-Source', 'Scalable']
  },
  { 
    name: 'MySQL',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg',
    category: 'Database',
    description: 'A popular, open-source relational database management system.',
    website: 'https://www.mysql.com',
    github: 'https://github.com/mysql/mysql-server',
    tags: ['Relational', 'Open-Source', 'Scalable']
  },
  { 
    name: 'Redis',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/redis/redis-original.svg',
    category: 'Database',
    description: 'An in-memory data store for building high-performance, scalable applications.',
    website: 'https://redis.io',
    github: 'https://github.com/redis/redis',
    tags: ['In-Memory', 'Scalable', 'High-Performance']
  },
  { 
    name: 'Cassandra',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/apache/apache-original.svg',
    category: 'Database',
    description: 'A highly scalable, NoSQL database for building distributed systems.',
    website: 'https://cassandra.apache.org',
    github: 'https://github.com/apache/cassandra',
    tags: ['NoSQL', 'Scalable', 'Distributed']
  },
  
  // Tools & Languages
  { 
    name: 'TypeScript',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg',
    category: 'Language',
    description: 'A statically typed, compiled language for building scalable and maintainable applications.',
    website: 'https://www.typescriptlang.org',
    github: 'https://github.com/microsoft/TypeScript',
    tags: ['Statically Typed', 'Compiled', 'Scalable']
  },
  { 
    name: 'GraphQL',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/graphql/graphql-plain.svg',
    category: 'Tool',
    description: 'A query language for building flexible and scalable APIs.',
    website: 'https://graphql.org',
    github: 'https://github.com/graphql/graphql-spec',
    tags: ['Query Language', 'API', 'Scalable']
  },
  { 
    name: 'Rust',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/rust/rust-plain.svg',
    category: 'Language',
    description: 'A systems programming language for building fast, reliable, and secure software.',
    website: 'https://www.rust-lang.org',
    github: 'https://github.com/rust-lang/rust',
    tags: ['Systems Programming', 'Fast', 'Reliable']
  },
  { 
    name: 'WebAssembly',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/webpack/webpack-original.svg',
    category: 'Tool',
    description: 'A binary instruction format for building high-performance, cross-platform applications.',
    website: 'https://webassembly.org',
    github: 'https://github.com/WebAssembly',
    tags: ['Binary Instruction Format', 'High-Performance', 'Cross-Platform']
  },
  { 
    name: 'Terraform',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/terraform/terraform-original.svg',
    category: 'DevOps',
    description: 'An infrastructure as code tool for building, changing, and versioning infrastructure.',
    website: 'https://www.terraform.io',
    github: 'https://github.com/hashicorp/terraform',
    tags: ['Infrastructure as Code', 'DevOps', 'Scalable']
  },
  
  // Mobile Development
  { 
    name: 'React Native',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg',
    category: 'Mobile',
    description: 'Create native apps for Android and iOS using React.',
    website: 'https://reactnative.dev',
    github: 'https://github.com/facebook/react-native',
    tags: ['Mobile', 'Cross-Platform', 'JavaScript']
  },
  { 
    name: 'Flutter',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/flutter/flutter-original.svg',
    category: 'Mobile',
    description: 'Google\'s UI toolkit for building natively compiled applications.',
    website: 'https://flutter.dev',
    github: 'https://github.com/flutter/flutter',
    tags: ['Mobile', 'Cross-Platform', 'Dart']
  },
  
  // AI/ML
  { 
    name: 'TensorFlow',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/tensorflow/tensorflow-original.svg',
    category: 'AI/ML',
    description: 'An end-to-end open source platform for machine learning.',
    website: 'https://tensorflow.org',
    github: 'https://github.com/tensorflow/tensorflow',
    tags: ['Machine Learning', 'Deep Learning', 'AI']
  },
  { 
    name: 'PyTorch',
    icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/pytorch/pytorch-original.svg',
    category: 'AI/ML',
    description: 'An open source machine learning framework.',
    website: 'https://pytorch.org',
    github: 'https://github.com/pytorch/pytorch',
    tags: ['Machine Learning', 'Deep Learning', 'AI']
  }
];

const StyledBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 800,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[24],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  maxHeight: '90vh',
  overflow: 'auto',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100%',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
}));

const ComposableStack = () => {
  const [selectedTech, setSelectedTech] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [filteredTech, setFilteredTech] = useState(technologies);

  useEffect(() => {
    const filterTechnologies = () => {
      return technologies.filter(tech => {
        const matchesCategory = selectedCategory === 'All' || tech.category === selectedCategory;
        const matchesSearch = !debouncedSearch || 
          tech.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          tech.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          tech.tags.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()));
        
        return matchesCategory && matchesSearch;
      });
    };

    setFilteredTech(filterTechnologies());
  }, [selectedCategory, debouncedSearch]);

  const handleTechClick = (tech) => {
    setSelectedTech(tech);
    setModalOpen(true);
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  return (
    <Box
      sx={{
        py: 8,
        background: 'linear-gradient(180deg, rgba(26,26,26,1) 0%, rgba(10,10,10,1) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            height: '100vh',
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              background: 'linear-gradient(45deg, #FF6B6B, #9c27b0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 4,
            }}
          >
            Part of your composable stack
          </Typography>

          <StyledTextField
            placeholder="Search technologies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ width: '100%', mb: 4 }}>
            <Tabs
              value={selectedCategory}
              onChange={handleCategoryChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(45deg, #FF6B6B, #9c27b0)',
                },
              }}
            >
              {categories.map((category) => (
                <Tab
                  key={category}
                  label={category}
                  value={category}
                  sx={{
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: 'white',
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ width: '100%' }}>
            {filteredTech.length === 0 ? (
              <Typography
                variant="h6"
                align="center"
                color="text.secondary"
                sx={{ mt: 4 }}
              >
                No technologies found matching your search.
              </Typography>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {filteredTech.map((tech, index) => (
                  <Box key={tech.name} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box>
                        <Typography variant="h6" component="h3">
                          {tech.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tech.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {tech.tags.map(tag => (
                            <StyledChip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <Tooltip title="Launch">
                          <IconButton onClick={() => handleTechClick(tech)}>
                            <LaunchIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfterTransition
      >
        <Fade in={modalOpen}>
          <StyledBox>
            <StyledIconButton onClick={() => setModalOpen(false)}>
              <CloseIcon />
            </StyledIconButton>
            
            <Typography variant="h5" component="h2" gutterBottom>
              {selectedTech && selectedTech.name}
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Category
                </Typography>
                <StyledChip
                  label={selectedTech && selectedTech.category}
                  size="small"
                  sx={{
                    background: 'linear-gradient(45deg, #FF6B6B, #9c27b0)',
                  }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2">
                  {selectedTech && selectedTech.description}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Tags
                </Typography>
                <Stack direction="row" spacing={1}>
                  {selectedTech && selectedTech.tags.map((tag) => (
                    <StyledChip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<LaunchIcon />}
                  component={Link}
                  href={selectedTech && selectedTech.website}
                  target="_blank"
                  rel="noopener"
                  sx={{
                    background: 'linear-gradient(45deg, #FF6B6B, #9c27b0)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF6B6B, #9c27b0)',
                      opacity: 0.9,
                    },
                  }}
                >
                  Website
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  component={Link}
                  href={selectedTech && selectedTech.github}
                  target="_blank"
                  rel="noopener"
                >
                  GitHub
                </Button>
              </Box>
            </Stack>
          </StyledBox>
        </Fade>
      </Modal>

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(156,39,176,0.1) 0%, rgba(10,10,10,0) 70%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

export default ComposableStack;
