import matplotlib.pyplot as plt
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


if __name__ == "__main__":
    train_input, train_target, test_input, test_target = prologue.load_data()

    print("train_input", train_input.size(), "train_target", train_target.size())
    print("test_input", test_input.size(), "test_target", test_target.size())

    print("Exercise 1")
    print(nearest_classification(train_input, train_target, x=test_input[0]))
    assert (
        nearest_classification(train_input, train_target, x=test_input[0])
        == test_target[0]
    ), "Prediction is not good !"
