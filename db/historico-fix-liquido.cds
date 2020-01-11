namespace jsg.fix_liquido;

type tyv_valor: Decimal(13, 3);

entity Historico {
  key ID : Integer;
  po_number  : String(10);
  po_item : String(5);
  trace_GUID: String(32);
  bruto_origem: tyv_valor;
  liquido_calculado: tyv_valor;
}
