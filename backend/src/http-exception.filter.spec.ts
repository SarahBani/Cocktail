import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
  const mockSwitchToHttp = jest.fn().mockReturnValue({ getResponse: mockGetResponse });

  const mockHost = {
    switchToHttp: mockSwitchToHttp,
    getArgByIndex: jest.fn(),
    getArgs: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  };

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    jest.clearAllMocks();
    mockStatus.mockReturnValue({ json: mockJson });
    mockGetResponse.mockReturnValue({ status: mockStatus });
    mockSwitchToHttp.mockReturnValue({ getResponse: mockGetResponse });
  });

  it('should respond with status and detail when response is a string', () => {
    const exception = new HttpException('Resource not found', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost as any);
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ detail: 'Resource not found' });
  });

  it('should respond with message from object response', () => {
    const exception = new HttpException(
      { message: 'Title already taken', error: 'Conflict' },
      HttpStatus.CONFLICT,
    );
    filter.catch(exception, mockHost as any);
    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(mockJson).toHaveBeenCalledWith({ detail: 'Title already taken' });
  });

  it('should fall back to exception.message when object has no message', () => {
    const exception = new HttpException({ error: 'Bad Request' }, HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockHost as any);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ detail: 'Bad Request' });
  });

  it('should handle 500 internal server error', () => {
    const exception = new HttpException('Internal error', HttpStatus.INTERNAL_SERVER_ERROR);
    filter.catch(exception, mockHost as any);
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ detail: 'Internal error' });
  });
});
