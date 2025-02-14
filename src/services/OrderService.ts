// src/services/order.service.ts
import { OrderRepository } from '../repositories/OrderRepository';
import { User } from '../entities/User';
import { validateAddress } from '../utils/geocoding';

export class OrderService {
    private orderRepository: OrderRepository;

    constructor() {
        this.orderRepository = new OrderRepository();
    }

    async createOrder(
        user: User,
        weight: number,
        dimensions: { length: number; width: number; height: number },
        productType: string,
        destinationAddress: string,
        returnAddress: string,
    ) {
        // Validar el peso del paquete
        if (weight <= 0) {
            throw new Error('El peso del paquete debe ser mayor a 0.');
        }

        // Validar las dimensiones del paquete
        if (
            dimensions.length <= 0 ||
            dimensions.width <= 0 ||
            dimensions.height <= 0
        ) {
            throw new Error('Las dimensiones del paquete deben ser mayores a 0.');
        }

        // Validar que las direcciones no estén vacías
        if (!destinationAddress || destinationAddress.trim() === '') {
            throw new Error('La dirección de destino no puede estar vacía.');
        }
        if (!returnAddress || returnAddress.trim() === '') {
            throw new Error('La dirección de retorno no puede estar vacía.');
        }

        // Validar la dirección de destino
        const isDestinationAddressValid = await validateAddress(destinationAddress);
        if (!isDestinationAddressValid) {
            throw new Error('La dirección de destino no es válida.');
        }

        // Validar la dirección de retorno
        const isReturnAddressValid = await validateAddress(returnAddress);
        if (!isReturnAddressValid) {
            throw new Error('La dirección de retorno no es válida.');
        }

        // Si todas las validaciones pasan, crear la orden
        return await this.orderRepository.createOrder(
            user,
            weight,
            dimensions,
            productType,
            destinationAddress,
            returnAddress,
        );
    }
}