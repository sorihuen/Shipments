import axios from 'axios';

interface GeocodingResult {
    lat: string;
    lon: string;
    display_name: string;
    address?: {
        road?: string;
        house_number?: string;
        city?: string;
        state?: string;
        country?: string;
    };
}

export async function validateAddress(address: string): Promise<{
    isValid: boolean;
    reason?: string;
}> {
    // Patrones básicos para direcciones colombianas
    const streetPatterns = [
        /\b(calle|carrera|avenida|diagonal|transversal|circular|autopista)\b/i,
        /\b(cll|cra|ave|diag|trans|circ|auto)\b/i
    ];
    
    const numberPattern = /[0-9]+[a-z]?(\s*[-#]\s*[0-9]+[a-z]?\s*[-]\s*[0-9]+)/i;
    
    // Validación inicial de estructura
    const hasStreetType = streetPatterns.some(pattern => pattern.test(address));
    const hasNumber = numberPattern.test(address);
    
    if (!hasStreetType) {
        return {
            isValid: false,
            reason: "La dirección debe incluir un tipo de vía válido (Calle, Carrera, Avenida, etc.)"
        };
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=CO&addressdetails=1`;
    
    try {
        const response = await axios.get<GeocodingResult[]>(url, {
            headers: {
                'User-Agent': 'TuAplicacion/1.0',
            },
            timeout: 5000
        });
        
        const data = response.data;
        
        if (!Array.isArray(data) || data.length === 0) {
            return {
                isValid: false,
                reason: "No se encontró la dirección en el sistema de geocodificación"
            };
        }

        const result = data[0];
        
        // Validaciones adicionales
        if (!result.address?.country || result.address.country !== 'Colombia') {
            return {
                isValid: false,
                reason: "La dirección debe estar en Colombia"
            };
        }

        if (!hasNumber) {
            return {
                isValid: false,
                reason: "La dirección debe incluir un número (ejemplo: #20-45)"
            };
        }

        // Verificar si la dirección tiene suficientes detalles
        const hasMinimumDetails = result.address?.road && 
                                result.address?.city &&
                                result.lat &&
                                result.lon;

        if (!hasMinimumDetails) {
            return {
                isValid: false,
                reason: "La dirección no tiene suficientes detalles para ser considerada válida"
            };
        }

        // Calcular score de confianza basado en los componentes presentes
        let confidenceScore = 0;
        if (result.address?.road) confidenceScore += 25;
        if (result.address?.house_number) confidenceScore += 25;
        if (result.address?.city) confidenceScore += 25;
        if (result.address?.state) confidenceScore += 25;

        if (confidenceScore < 75) {
            return {
                isValid: false,
                reason: `La dirección no es suficientemente específica (score: ${confidenceScore}/100)`
            };
        }

        console.log(`Dirección válida: ${address}`, {
            confidence: confidenceScore,
            details: result.address
        });

        return {
            isValid: true
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al validar la dirección:', errorMessage);
        
        return {
            isValid: false,
            reason: `Error en la validación: ${errorMessage}`
        };
    }
}