import VoyaAI from './pages/VoyaAI';
import Tasks from './pages/Tasks';
import Workspace from './pages/Workspace';
import AIDesigner from './pages/AIDesigner';
import VideoCompanion from './pages/VideoCompanion';
import StoryBuilder from './pages/StoryBuilder';
import MemeMaker from './pages/MemeMaker';
import PrivacyDashboard from './pages/PrivacyDashboard';
import AITeam from './pages/AITeam';
import EmotionalJournal from './pages/EmotionalJournal';
import Achievements from './pages/Achievements';
import __Layout from './Layout.jsx';


export const PAGES = {
    "VoyaAI": VoyaAI,
    "Tasks": Tasks,
    "Workspace": Workspace,
    "AIDesigner": AIDesigner,
    "VideoCompanion": VideoCompanion,
    "StoryBuilder": StoryBuilder,
    "MemeMaker": MemeMaker,
    "PrivacyDashboard": PrivacyDashboard,
    "AITeam": AITeam,
    "EmotionalJournal": EmotionalJournal,
    "Achievements": Achievements,
}

export const pagesConfig = {
    mainPage: "VoyaAI",
    Pages: PAGES,
    Layout: __Layout,
};