export type Lang = 'en' | 'zh';

export const t = {
  nav_home: { en: 'Home', zh: '首页' },
  nav_about: { en: 'About', zh: '关于' },
  nav_publications: { en: 'Publications', zh: '论文' },
  nav_projects: { en: 'Projects', zh: '项目' },
  nav_blog: { en: 'Blog', zh: '博客' },
  lang_switch: { en: '中文', zh: 'English' },
  tagline: {
    en: 'MSc Robotics Engineering, University of Bristol. Research in combinatorial optimization, graph neural networks, and deep learning for industrial systems.',
    zh: '布里斯托大学机器人工程硕士。研究方向：组合优化、图神经网络，以及深度学习在工业系统中的应用。',
  },
  recent_pub: { en: 'Recent Publications', zh: '最新论文' },
  recent_blog: { en: 'Recent Writing', zh: '最新博客' },
  all_pub: { en: 'See all publications', zh: '查看全部论文' },
  all_blog: { en: 'See all posts', zh: '查看全部博客' },
  all_projects: { en: 'See all projects', zh: '查看全部项目' },
  under_review: { en: 'Under review', zh: '审稿中' },
  contact: { en: 'Contact', zh: '联系方式' },
  education: { en: 'Education', zh: '教育经历' },
  experience: { en: 'Experience', zh: '实习经历' },
  research_interests: { en: 'Research Interests', zh: '研究兴趣' },
  skills: { en: 'Skills', zh: '专业能力' },
  awards: { en: 'Selected Awards', zh: '竞赛获奖' },
  publications_title: { en: 'Publications', zh: '论文' },
  projects_title: { en: 'Projects', zh: '项目' },
  blog_title: { en: 'Blog', zh: '博客' },
  about_title: { en: 'About', zh: '关于我' },
  back: { en: '← Back', zh: '← 返回' },
  pdf: { en: 'pdf', zh: 'pdf' },
  webpage: { en: 'webpage', zh: '主页' },
  abstract: { en: 'abstract', zh: '摘要' },
  bibtex: { en: 'bibtex', zh: '引用' },
  arxiv: { en: 'arXiv', zh: 'arXiv' },
  code_link: { en: 'code', zh: '代码' },
  repo: { en: 'repo', zh: '仓库' },
  demo: { en: 'demo', zh: '演示' },
} as const;

export function tr(key: keyof typeof t, lang: Lang): string {
  return t[key][lang];
}

export function otherLang(lang: Lang): Lang {
  return lang === 'en' ? 'zh' : 'en';
}

export function langPath(lang: Lang, path: string = ''): string {
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '');
  if (lang === 'en') return clean ? `/${clean}/` : '/';
  return clean ? `/zh/${clean}/` : '/zh/';
}
