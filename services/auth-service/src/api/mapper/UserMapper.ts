/**
 * UserMapper
 * Mapper pour convertir entre DTOs et Models
 *
 * Architecture : Mapper pattern
 * - Conversion DTO ↔ Model
 * - Séparation claire des responsabilités
 */
import { User, UserData } from "../../models/User";
import { UserPublicDTO, UserCreateDTO } from "../dto";

export class UserMapper {
  /**
   * Convertir un UserCreateDTO en UserData
   */
  static userCreateDTOToUserData(
    userCreateDTO: UserCreateDTO
  ): Partial<UserData> {
    return {
      email: userCreateDTO.email,
      first_name: userCreateDTO.firstName,
      last_name: userCreateDTO.lastName,
    };
  }

  /**
   * Convertir un User en UserPublicDTO
   * Inclut tous les champs nécessaires pour le frontend
   */
  static userToPublicDTO(user: User): UserPublicDTO {
    return {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName(),
      isActive: user.isActive,
      isBackofficeApproved: user.isBackofficeApproved,
      isBackofficeRejected: user.isBackofficeRejected,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
