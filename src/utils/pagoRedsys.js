import clientesAxios from "../config/axios";

/**
 * Inicia el pago con Redsys para un pedido existente.
 * Pide los datos firmados al backend, construye un formulario oculto
 * y lo hace submit hacia el TPV (CaixaBank).
 *
 * El navegador sale de la SPA hacia el dominio del banco.
 * La función no retorna en caso de éxito: el submit redirige.
 *
 * @param {string} codigo - Código del pedido (ej: PED-20260423-A3F7)
 * @throws {Error} si falla la petición al backend
 */
export async function iniciarPagoRedsys(codigo) {
  const { data: redsys } = await clientesAxios.post(
    `/shop/pedidos/${codigo}/redsys/iniciar`,
  );

  const formEl = document.createElement("form");
  formEl.method = "POST";
  formEl.action = redsys.url_tpv;
  formEl.style.display = "none";

  const campos = {
    Ds_SignatureVersion: redsys.Ds_SignatureVersion,
    Ds_MerchantParameters: redsys.Ds_MerchantParameters,
    Ds_Signature: redsys.Ds_Signature,
  };

  Object.entries(campos).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    formEl.appendChild(input);
  });

  document.body.appendChild(formEl);
  formEl.submit();
}
