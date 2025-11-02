// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en_util from './locales/en/utilities.json';
import mr_util from './locales/mr/utilities.json';
import hi_util from './locales/hi/utilities.json';
import sp_util from './locales/sp/utilities.json';
import fr_util from './locales/fr/utilities.json';


import en_dash from './locales/en/dashboard.json';
import mr_dash from './locales/mr/dashboard.json';
import hi_dash from './locales/hi/dashboard.json';
import sp_dash from './locales/sp/dashboard.json';
import fr_dash from './locales/fr/dashboard.json';

import en_datagrid from './locales/en/datagrid.json';
import mr_Datagrid from './locales/mr/datagrid.json';
import hi_Datagrid from './locales/hi/datagrid.json';
import sp_Datagrid from './locales/sp/datagrid.json';
import fr_Datagrid from './locales/fr/datagrid.json';

import en_lgf from './locales/en/ListGridFilters.json';
import mr_lgf from './locales/mr/ListGridFilters.json';
import hi_lgf from './locales/hi/ListGridFilters.json';
import sp_lgf from './locales/sp/ListGridFilters.json';
import fr_lgf from './locales/fr/ListGridFilters.json';


import en_mainlayout from './locales/en/mainlayout.json';
import mr_mainlayout from './locales/mr/mainlayout.json';
import hi_mainlayout from './locales/hi/mainlayout.json'; 
import sp_mainlayout from './locales/sp/mainlayout.json';
import fr_mainlayout from './locales/fr/mainlayout.json';


import en_title from './locales/en/title.json';
import mr_title from './locales/mr/title.json';
import hi_title from './locales/hi/title.json'; 
import sp_title from './locales/sp/title.json';
import fr_title from './locales/fr/title.json';

import en_teacherView from './locales/en/TeacherView.json';
import mr_teacherView from './locales/mr/TeacherView.json';
import hi_teacherView from './locales/hi/TeacherView.json'; 
import sp_teacherView from './locales/sp/TeacherView.json';
import fr_teacherView from './locales/fr/TeacherView.json';

import en_profile from './locales/en/profile.json';
import mr_profile from './locales/mr/profile.json';
import hi_profile from './locales/hi/profile.json'; 
import sp_profile from './locales/sp/profile.json';
import fr_profile from './locales/fr/profile.json';

import en_edit from './locales/en/edit.json';
import mr_edit from './locales/mr/edit.json';
import hi_edit from './locales/hi/edit.json'; 
import sp_edit from './locales/sp/edit.json';
import fr_edit from './locales/fr/edit.json';

import en_exam from './locales/en/exam.json';
import mr_exam from './locales/mr/exam.json';
import hi_exam from './locales/hi/exam.json'; 
import sp_exam from './locales/sp/exam.json';
import fr_exam from './locales/fr/exam.json';

import en_idcard from './locales/en/idcard.json';
import mr_idcard from './locales/mr/idcard.json';
import hi_idcard from './locales/hi/idcard.json'; 
import sp_idcard from './locales/sp/idcard.json';
import fr_idcard from './locales/fr/idcard.json';

import en_lms from './locales/en/lms.json';
import mr_lms from './locales/mr/lms.json';
import hi_lms from './locales/hi/lms.json'; 
import sp_lms from './locales/sp/lms.json';
import fr_lms from './locales/fr/lms.json';

import en_notifications from './locales/en/notifications.json';
import mr_notifications from './locales/mr/notifications.json';
import hi_notifications from './locales/hi/notifications.json'; 
import sp_notifications from './locales/sp/notifications.json';
import fr_notifications from './locales/fr/notifications.json';

import en_quiz from './locales/en/quiz.json';
import mr_quiz from './locales/mr/quiz.json';
import hi_quiz from './locales/hi/quiz.json'; 
import sp_quiz from './locales/sp/quiz.json';
import fr_quiz from './locales/fr/quiz.json';
const resources = {
  en: {
    utilities: en_util.menu.masters,
    dashboard: en_dash,
    translation: { ...en_util, ...en_dash },
    datagrid: en_datagrid,
    ListGridFilters: en_lgf ,
    mainlayout: en_mainlayout,
    title: en_title ,
    teacherView: en_teacherView,
    profile: en_profile,
    edit: en_edit,
    exam: en_exam,
    idcard: en_idcard,
    lms: en_lms ,
    notification: en_notifications,
    quiz: en_quiz
  },
  mr: {
    utilities: mr_util.menu.masters,
    dashboard: mr_dash,
    translation: { ...mr_util, ...mr_dash },
    datagrid: mr_Datagrid,
    ListGridFilters: mr_lgf ,
    mainlayout: mr_mainlayout,
    title: mr_title,
    teacherView: mr_teacherView,
    profile: mr_profile,
    edit: mr_edit,
    exam: mr_exam,
    idcard: mr_idcard,
    lms: mr_lms ,
    notification: mr_notifications ,
    quiz: mr_quiz
  },
    sp: {
    utilities: sp_util.menu.masters,
    dashboard: sp_dash,
    translation: { ...sp_util, ...sp_dash },
    datagrid: sp_Datagrid,
    ListGridFilters: sp_lgf ,
    mainlayout: sp_mainlayout,
    title: sp_title ,
    teacherView: sp_teacherView,
    profile: sp_profile,
    edit: sp_edit,
    exam: sp_exam,
    idcard: sp_idcard ,
    lms: sp_lms ,
    notification: sp_notifications ,
    quiz: sp_quiz
  },
  hi: {
    utilities: hi_util.menu.masters,
    dashboard: hi_dash,
    translation: { ...hi_util, ...hi_dash },
    datagrid: hi_Datagrid,
    ListGridFilters: hi_lgf ,
    mainlayout: hi_mainlayout,
    title: hi_title,
    teacherView: hi_teacherView,
    profile: hi_profile,
    edit: hi_edit,
    exam: hi_exam,
    idcard: hi_idcard ,
    lms: hi_lms ,
    notification: hi_notifications ,
    quiz: hi_quiz
  },
  fr: {
    utilities: fr_util.menu.masters,
    dashboard: fr_dash,
    translation: { ...fr_util, ...fr_dash },
    datagrid: fr_Datagrid,
    ListGridFilters: fr_lgf ,
    mainlayout: fr_mainlayout,  
    title: fr_title,
    teacherView: fr_teacherView,
    profile: fr_profile ,
    edit: fr_edit,
    exam: fr_exam,
    idcard: fr_idcard ,
    lms: fr_lms ,
    notification: fr_notifications ,
    quiz: fr_quiz
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    ns: ['utilities', 'dashboard', 'translation', 'datagrid', 'ListGridFilters', 'mainlayout', 'title'], // added
    defaultNS: 'translation',
    keySeparator: '.',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] }
  });

export default i18n;
