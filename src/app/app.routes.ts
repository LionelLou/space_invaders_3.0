import { Routes } from '@angular/router';
import { SpaceInvader } from './space-invader/space-invader';
import { Homepage } from './homepage/homepage';

export const routes: Routes = [
    {
        path: "",
        component: Homepage
    },
    {
        path: "space-invaders",
        component: SpaceInvader
    }
];
