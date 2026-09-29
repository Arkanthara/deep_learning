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
