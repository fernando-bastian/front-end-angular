import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Api } from './api';
import { mensagemErro } from './formulario';

export const sessaoGuard: CanActivateFn = async (_route, state) => {
  const api = inject(Api);
  const router = inject(Router);
  try {
    if (await api.restaurarSessao()) return true;
  } catch (error) {
    api.erroSessao.set(mensagemErro(error));
  }
  return router.createUrlTree(['/login'], { queryParams: { retorno: state.url } });
};
