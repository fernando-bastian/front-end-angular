import { Routes } from '@angular/router';
import { Cadastros } from './cadastros/cadastros';
import { Inicio } from './inicio/inicio';
import { Login } from './login/login';
import { Transacoes } from './transacoes/transacoes';
import { Transferencias } from './transferencias/transferencias';
import { sessaoGuard } from './core/sessao.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', component: Inicio, canActivate: [sessaoGuard], pathMatch: 'full' },
  {
    path: 'contas',
    component: Cadastros,
    canActivate: [sessaoGuard],
    data: { recurso: 'contas', titulo: 'Contas' },
  },
  {
    path: 'categorias',
    component: Cadastros,
    canActivate: [sessaoGuard],
    data: { recurso: 'categorias', titulo: 'Categorias' },
  },
  { path: 'transacoes', component: Transacoes, canActivate: [sessaoGuard] },
  { path: 'transferencias', component: Transferencias, canActivate: [sessaoGuard] },
  { path: 'pagina1', redirectTo: 'categorias' },
  { path: 'conta', redirectTo: 'contas' },
  { path: '**', redirectTo: '' },
];
