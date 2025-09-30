/**
 * UserMapper
 * Mapper pour convertir entre DTOs et Models
 *
 * Architecture : Mapper pattern
 * - Conversion DTO ↔ Model
 * - Séparation claire des responsabilités
 */
import { User, UserDataInput } from "../../models/User";
import {
  UserPublicDTO,
  UserRegistrationDTO,
  UserUpdateDTO,
  AuthenticatedUserDTO,
} from "../dto";

export class UserMapper {
  /**
   * Convertir un UserRegistrationDTO en UserDataInput
   */
  static userRegistrationDTOToUserDataInput(
    userRegistrationDTO: UserRegistrationDTO
  ): Partial<UserDataInput> {
    return {
      email: userRegistrationDTO.email,
      first_name: userRegistrationDTO.firstName,
      last_name: userRegistrationDTO.lastName,
      role: userRegistrationDTO.role || "customer",
    };
  }

  /**
   * Convertir un UserUpdateDTO en UserDataInput
   */
  static userUpdateDTOToUserDataInput(
    userUpdateDTO: UserUpdateDTO
  ): Partial<UserDataInput> {
    const updateData: Partial<UserDataInput> = {};

    if (userUpdateDTO.firstName !== undefined) {
      updateData.first_name = userUpdateDTO.firstName;
    }
    if (userUpdateDTO.lastName !== undefined) {
      updateData.last_name = userUpdateDTO.lastName;
    }
    if (userUpdateDTO.email !== undefined) {
      updateData.email = userUpdateDTO.email;
    }
    if (userUpdateDTO.role !== undefined) {
      updateData.role = userUpdateDTO.role;
    }
    if (userUpdateDTO.isActive !== undefined) {
      updateData.is_active = userUpdateDTO.isActive;
    }

    return updateData;
  }

  /**
   * Convertir un User en UserPublicDTO
   */
  static userToPublicDTO(user: User): UserPublicDTO {
    return {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName(),
      role: user.role,
      isActive: user.isActive,
    };
  }

  /**
   * Convertir un JWTPayload en AuthenticatedUserDTO
   * Séparation entre Model et DTO
   */
  static jwtPayloadToAuthenticatedUserDTO(
    jwtPayload: any
  ): AuthenticatedUserDTO {
    return {
      userId: jwtPayload.userId,
      email: jwtPayload.email,
      role: jwtPayload.role,
      firstName: jwtPayload.firstName,
      lastName: jwtPayload.lastName,
    };
  }
}
