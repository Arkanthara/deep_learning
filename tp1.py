import torch
import time

if __name__ == "__main__":
    print("Exercise 1")
    x = torch.full((13, 13), 1)
    x[1::5, :] = 2
    x[:, 1::5] = 2
    x[3:5, 3:5] = 3
    x[8:10, 8:10] = 3
    x[3:5, 8:10] = 3
    x[8:10, 3:5] = 3
    print(x)

    print("Exercise 2")
    # M = torch.rand((20, 20))
    # M = torch.empty((20, 20)).normal_(0.0, 1.0)
    M = torch.empty((20, 20))
    M.normal_(0.0, 1.0)
    diag = torch.arange(1, 21)
    D = torch.diag(diag)
    A = torch.inverse(M) @ D.to(torch.float) @ M
    print(torch.linalg.eig(A))

    print("Exercise 3")
    C = torch.empty(5000, 5000).normal_(0.0, 1.0)
    D = torch.empty(5000, 5000).normal_(0.0, 1.0)
    start = time.perf_counter()
    E = C @ D
    end = time.perf_counter()
    print(f"Number of operations: {5000 * 5000}")
    print(end - start)

    def mul_row(m: torch.Tensor):
        for i in range(m.shape[0]):
            m[i] *= i + 1

    def mul_row_fast(m: torch.Tensor):
        rows = torch.arange(1, m.shape[0] + 1).view(-1, 1)
        m *= rows

    F = torch.empty(1000, 400).normal_(0.0, 1.0)
    # F1 = F.copy_()
    # F2 = F.copy_()
    start = time.perf_counter()
    mul_row(F)
    end = time.perf_counter()
    print(end - start)

    start = time.perf_counter()
    mul_row_fast(F)
    end = time.perf_counter()
    print(end - start)
