using { jsg.fix_liquido } from '../db/data-model';

service CatalogService {
  entity Historico @readonly as projection on fix_liquido.Historico;
}