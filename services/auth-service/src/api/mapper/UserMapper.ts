/**
 * UserMapper
 * Mapper pour convertir entre DTOs et Models
 *
 * Architecture : Mapper pattern
 * - Conversion DTO ↔ Model
 * - Séparation claire des responsabilités
 */
import { User, UserData } from "../../models/User";
import { UserPublicDTO, UserCreateDTO, UserUpdateDTO } from "../dto";

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
   * Convertir un UserUpdateDTO en UserData
   */
  static userUpdateDTOToUserData(
    userUpdateDTO: UserUpdateDTO
  ): Partial<UserData> {
    const updateData: Partial<UserData> = {};

    if (userUpdateDTO.firstName !== undefined) {
      updateData.first_name = userUpdateDTO.firstName;
    }
    if (userUpdateDTO.lastName !== undefined) {
      updateData.last_name = userUpdateDTO.lastName;
    }
    if (userUpdateDTO.email !== undefined) {
      updateData.email = userUpdateDTO.email;
    }
    if (userUpdateDTO.isActive !== undefined) {
      updateData.is_active = userUpdateDTO.isActive;
    }

    return updateData;
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
