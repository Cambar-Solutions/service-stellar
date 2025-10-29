import { HttpException, HttpStatus } from '@nestjs/common';
import { stringConstants } from 'src/utils/string.constant';

export class NotFoundCustomException extends HttpException {
  constructor(type: NotFoundCustomExceptionType) {
    let message;
    switch (type) {
      case NotFoundCustomExceptionType.USER:
        message = stringConstants.userNotFound;
        break;
      case NotFoundCustomExceptionType.BRAND:
        message = stringConstants.brandNotFound;
        break;
      case NotFoundCustomExceptionType.CATEGORY:
        message = stringConstants.categoryNotFound;
        break;
      case NotFoundCustomExceptionType.PRODUCT:
        message = stringConstants.productNotFound;
        break;
      case NotFoundCustomExceptionType.MEDIA:
        message = stringConstants.mediaNotFound;
        break;
      case NotFoundCustomExceptionType.LANDING:
        message = stringConstants.landingNotFound;
        break;
      case NotFoundCustomExceptionType.BRAND_CATEGORY:
        message = stringConstants.brandCategoryNotFound;
        break;
      case NotFoundCustomExceptionType.USER_ADDRESS:
        message = stringConstants.userAddressNotFound;
        break;
      case NotFoundCustomExceptionType.SUBCATEGORY:
        message = stringConstants.subcategoryNotFound;
        break;
      case NotFoundCustomExceptionType.COLOR:
        message = stringConstants.colorNotFound;
        break;
      case NotFoundCustomExceptionType.SIZE_MSTR:
        message = stringConstants.sizeMstrNotFound;
        break;
      case NotFoundCustomExceptionType.SIZE_DETAIL:
        message = stringConstants.sizeDetailNotFound;
        break;
      case NotFoundCustomExceptionType.PRODUCT_COLOR_SIZE_DETAIL:
        message = stringConstants.productColorSizeDetailNotFound;
        break;
      case NotFoundCustomExceptionType.ORDER_MSTR:
        message = stringConstants.orderMstrNotFound;
        break;
      case NotFoundCustomExceptionType.ORDER_DETAIL:
        message = stringConstants.orderDetailNotFound;
        break;
      case NotFoundCustomExceptionType.BILL:
        message = stringConstants.billNotFound;
        break;
      case NotFoundCustomExceptionType.WHATSAPP:
        message = stringConstants.whatsappNotFound;
        break;
      case NotFoundCustomExceptionType.CART:
        message = stringConstants.cartNotFound;
        break;
      case NotFoundCustomExceptionType.COMPANY:
        message = stringConstants.companyNotFound;
        break;
      case NotFoundCustomExceptionType.SITE:
        message = stringConstants.siteNotFound;
        break;
      case NotFoundCustomExceptionType.SITE_STYLE:
        message = stringConstants.siteStyleNotFound;
        break;
      case NotFoundCustomExceptionType.CUSTOMER:
        message = stringConstants.customerNotFound;
        break;
      case NotFoundCustomExceptionType.RESERVATION:
        message = stringConstants.reservationNotFound;
        break;
      case NotFoundCustomExceptionType.PROMPT:
        message = stringConstants.promptNotFound;
        break;
      case NotFoundCustomExceptionType.EXAMPLE:
        message = stringConstants.exampleNotFound;
      default:
        message = stringConstants.notFound;
    }
    super(message, HttpStatus.NOT_FOUND);
  }
}

export enum NotFoundCustomExceptionType {
  USER,
  BRAND,
  CATEGORY,
  BRAND_CATEGORY,
  PRODUCT,
  MEDIA,
  LANDING,
  USER_ADDRESS,
  SUBCATEGORY,
  COLOR,
  SIZE_MSTR,
  SIZE_DETAIL,
  PRODUCT_COLOR_SIZE_DETAIL,
  ORDER_MSTR,
  ORDER_DETAIL,
  BILL,
  WHATSAPP,
  CART,
  COMPANY,
  SITE,
  SITE_STYLE,
  CUSTOMER,
  RESERVATION,
  PROMPT,
  EXAMPLE
}
