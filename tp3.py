import torch

import dlc_practical_prologue as prologue


def sigma(x: torch.Tensor) -> torch.Tensor:
    return torch.tanh(x)


def dsigma(x: torch.Tensor) -> torch.Tensor:
    return 1 - torch.tanh(x) ** 2


def loss(v: torch.Tensor, t: torch.Tensor) -> torch.Tensor:
    return torch.sum((t - v) ** 2)


def dloss(v: torch.Tensor, t: torch.Tensor) -> torch.Tensor:
    return 2 * torch.sum(v - t)


def forward_pass(
    w1: torch.Tensor,
    b1: torch.Tensor,
    w2: torch.Tensor,
    b2: torch.Tensor,
    x: torch.Tensor,
) -> tuple:
    x0 = x.detach().clone()
    s1 = x @ w1.t() + b1.view(1, -1)
    x1 = sigma(s1)
    s2 = x @ w2.t() + b2.view(1, -1)
    x2 = sigma(s2)
    return (x0, s1, x1, s2, x2)


def backward_pass(
    w1: torch.Tensor,
    b1: torch.Tensor,
    w2: torch.Tensor,
    b2: torch.Tensor,
    t: torch.Tensor,
    x: torch.Tensor,
    s1: torch.Tensor,
    x1: torch.Tensor,
    s2: torch.Tensor,
    x2: torch.Tensor,
    dl_dw1: torch.Tensor,
    dl_db1: torch.Tensor,
    dl_dw2: torch.Tensor,
    dl_db2: torch.Tensor,
):
    return


if __name__ == "__main__":
    train_input, train_target, test_input, test_target = prologue.load_data()

    print(
        "train_input",
        train_input.size(),
        train_input.dtype,
        "train_target",
        train_target.size(),
        train_target.dtype,
    )
    print("test_input", test_input.size(), "test_target", test_target.size())
