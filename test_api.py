import json
import requests

BASE_URL = "https://abjinfo.com.br/api"

payload = {
    "nome": "Teste Python",
    "enderecoIP": "192.168.0.50",
    "localizacao": "Home Office",
    "tipoEquipamento": "Notebook",
    "status": "Ativo",
}


def show_response(label, response):
    print(f"\n--- {label} ---")
    print("Status:", response.status_code)
    print("Content-Type:", response.headers.get("content-type"))
    try:
        print("Body JSON:", json.dumps(response.json(), ensure_ascii=False, indent=2))
    except Exception:
        print("Body texto:", response.text[:1000])


def main():
    try:
        get_resp = requests.get(f"{BASE_URL}/equipment", timeout=20)
        show_response("GET /equipment", get_resp)

        post_resp = requests.post(f"{BASE_URL}/equipment", json=payload, timeout=20)
        show_response("POST /equipment", post_resp)
    except requests.RequestException as exc:
        print("Erro de rede:", str(exc))


if __name__ == "__main__":
    main()
