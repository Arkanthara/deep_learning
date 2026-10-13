# Any copyright is dedicated to the Public Domain.
# https://creativecommons.org/publicdomain/zero/1.0/

# Written by Francois Fleuret <francois@fleuret.org>

import torch
from torch import nn
from torch.nn import functional as F

import dlc_practical_prologue as prologue


######################################################################


class Net(nn.Module):
    def __init__(self, hidden_units: int = 200):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=5)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=5)
        self.fc1 = nn.Linear(256, hidden_units)
        self.fc2 = nn.Linear(hidden_units, 10)

    def forward(self, x):
        x = F.relu(F.max_pool2d(self.conv1(x), kernel_size=3, stride=3))
        x = F.relu(F.max_pool2d(self.conv2(x), kernel_size=2, stride=2))
        x = F.relu(self.fc1(x.view(-1, 256)))
        x = self.fc2(x)
        return x


def train_model(
    model,
    train_input: torch.Tensor,
    train_target: torch.Tensor,
    mini_batch_size: int = 100,
):
    eta = 1e-1
    nb_epochs = 100
    criterion = nn.MSELoss()
    for e in range(nb_epochs):
        acc_loss = 0
        # We do this with mini-batches
        for b in range(0, train_input.size(0), mini_batch_size):
            output = model(train_input.narrow(0, b, mini_batch_size))
            loss = criterion(output, train_target.narrow(0, b, mini_batch_size))
            acc_loss = acc_loss + loss.item()

            model.zero_grad()
            loss.backward()
            with torch.no_grad():
                for p in model.parameters():
                    p -= eta * p.grad
        compute_nb_errors(model, train_input, train_target)

        print(e, acc_loss)


def compute_nb_errors(
    model, input: torch.Tensor, target: torch.Tensor, mini_batch_size: int = 100
):
    nb_errors = 0
    for b in range(0, input.size(0), mini_batch_size):
        output = model(input.narrow(0, b, mini_batch_size))
        pred_idx = output.max(1)[1]
        target_idx = target.narrow(0, b, mini_batch_size).max(1)[1]
        nb_errors += (pred_idx != target_idx).sum().item()
    return nb_errors


class Net2(nn.Module):
    def __init__(self, hidden_units: int = 200):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=5)
        self.conv2 = nn.Conv2d(32, 32, kernel_size=5)
        self.conv3 = nn.Conv2d(32, 64, kernel_size=5)
        self.fc1 = nn.Linear(256, hidden_units)
        self.fc2 = nn.Linear(hidden_units, 10)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(F.max_pool2d(self.conv2(x), kernel_size=2))
        x = F.relu(self.conv3(x))
        x = F.relu(self.fc1(x.view(-1, 256)))
        x = self.fc2(x)
        return x


if __name__ == "__main__":
    train_input, train_target, test_input, test_target = prologue.load_data(
        one_hot_labels=True, normalize=True, flatten=False
    )
    model = Net2()
    train_model(model, train_input, train_target)
    errs = compute_nb_errors(model, test_input, test_target)
    print("Error rate: ", 100 * errs / test_input.size(0))
