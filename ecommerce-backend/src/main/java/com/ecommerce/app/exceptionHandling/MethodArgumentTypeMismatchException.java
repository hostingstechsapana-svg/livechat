package com.ecommerce.app.exceptionHandling;

public class MethodArgumentTypeMismatchException extends RuntimeException{
	public MethodArgumentTypeMismatchException(String message) {
		super(message);
	}
}
