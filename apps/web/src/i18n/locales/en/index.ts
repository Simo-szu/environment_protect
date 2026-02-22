import type { StringMessages } from '../zh';
import common from './common';
import metadata from './metadata';
import navigation from './navigation';
import auth from './auth';
import home from './home';
import activities from './activities';
import register from './register';
import science from './science';
import article from './article';
import notifications from './notifications';
import myActivities from './myActivities';
import profile from './profile';
import favorites from './favorites';
import likes from './likes';
import points from './points';
import game from './game';
import host from './host';
import admin from './admin';
import pagination from './pagination';
import footer from './footer';
import contact from './contact';
import help from './help';
import feedback from './feedback';
import privacy from './privacy';
import terms from './terms';

// StringMessages enforces that all namespaces and keys exist (matching zh structure),
// while allowing any string values (not constrained to zh literal strings).
const en: StringMessages = {
    common,
    metadata,
    navigation,
    auth,
    home,
    activities,
    register,
    science,
    article,
    notifications,
    myActivities,
    profile,
    favorites,
    likes,
    points,
    game,
    host,
    admin,
    pagination,
    footer,
    contact,
    help,
    feedback,
    privacy,
    terms,
};

export default en;
