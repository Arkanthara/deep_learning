import matplotlib.pyplot as plt
from numpy import float32
import torch

import dlc_practical_prologue as prologue


def print_image(img: torch.Tensor) -> None:
    plt.figure()
    plt.imshow(img.view(28, 28), cmap="gray")
    plt.axis("off")
    plt.show()


def nearest_classification(
    train_input: torch.Tensor, train_target: torch.Tensor, x: torch.Tensor
) -> torch.Tensor:
    norm = torch.mean((train_input - x.view(1, -1)) ** 2, dim=1)
    return train_target[int(torch.min(norm, 0)[1].item())]


def compute_nb_errors(
    train_input: torch.Tensor,
    train_target: torch.Tensor,
    test_input: torch.Tensor,
    test_target: torch.Tensor,
    mean=None,
    proj=None,
):
    if mean is not None:
        train_input -= mean
        test_input -= mean
    if proj is not None:
        train_input @= proj.to(torch.float32).t()
        test_input @= proj.to(torch.float32).t()
    train_input_ext = torch.unsqueeze_copy(train_input, 0).expand(
        test_input.shape[0], -1, -1
    )
    norm_test = torch.mean((train_input_ext - test_input.unsqueeze(1)) ** 2, dim=2)
    prediction = train_target[torch.min(norm_test, dim=1)[1].to(int)]
    return torch.sum(prediction != test_target).item()


def PCA(x: torch.Tensor) -> torch.Tensor:
    A = x - x.mean(0)
    l, u = torch.linalg.eig(A.t() @ A)
    print(l)
    order = l.abs().sort(descending=True)[1]
    return u[order]


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

    print("Exercise 1")
    print(nearest_classification(train_input, train_target, x=test_input[0]))
    assert (
        nearest_classification(train_input, train_target, x=test_input[0])
        == test_target[0]
    ), "Prediction is not good !"

    print("Exercise 2")
    print(compute_nb_errors(train_input, train_target, test_input, test_target))

    print("Exercise 3")
    proj = PCA(train_input)

    print("Exercise 4")
    train_mean = torch.mean(train_input, dim=0)
    print(
        compute_nb_errors(
            train_input,
            train_target,
            test_input,
            test_target,
            mean=train_mean,
            proj=proj,
        )
    )
