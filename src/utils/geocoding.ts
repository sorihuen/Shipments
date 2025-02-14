// src/utils/geocoding.ts
import axios from 'axios';


export async function validateAddress(address: string): Promise<boolean> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=CO`;
    console.log('URL de validación:', url);

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'TuAplicacion/1.0',
            },
        });

        const data = response.data;

        // Verificar si la respuesta contiene resultados válidos con coordenadas y detalles específicos
        if (
            Array.isArray(data) &&
            data.length > 0 &&
            data[0].lat &&
            data[0].lon &&
            data[0].display_name
        ) {
            console.log(`Dirección válida: ${address}`);
            return true;
        } else {
            console.warn(`Dirección inválida o incompleta: ${address}`);
            return false;
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error al validar la dirección:', error.message);
        } else {
            console.error('Error desconocido al validar la dirección.');
        }
        return false;
    }
}