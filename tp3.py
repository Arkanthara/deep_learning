import torch

import dlc_practical_prologue as prologue


def sigma(x: torch.Tensor) -> torch.Tensor:
    return torch.tanh(x)


def dsigma(x: torch.Tensor) -> torch.Tensor:
    return 1 - torch.tanh(x) ** 2


def loss(v: torch.Tensor, t: torch.Tensor) -> torch.Tensor:
    return torch.sum((t - v) ** 2)


def dloss(v: torch.Tensor, t: torch.Tensor) -> torch.Tensor:
    return 2 * (v - t)


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
    s2 = x1 @ w2.t() + b2.view(1, -1)
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
    dl_dx2 = dloss(x2, t)
    dl_ds2 = dl_dx2 * dsigma(s2)
    dl_dx1 = dl_ds2 @ w2
    dl_ds1 = dl_dx1 * dsigma(s1)

    dl_dw2 += dl_ds2.view(-1, 1) @ x1.view(1, -1)
    dl_db2 += dl_ds2.view(-1)
    dl_dw1 += dl_ds1.view(-1, 1) @ x.view(1, -1)
    dl_db1 += dl_ds1.view(-1)


if __name__ == "__main__":
    train_input, train_target, test_input, test_target = prologue.load_data(
        one_hot_labels=True, normalize=True
    )

    print(
        "train_input",
        train_input.size(),
        train_input.dtype,
        "train_target",
        train_target.size(),
        train_target.dtype,
    )
    print("test_input", test_input.size(), "test_target", test_target.size())

    print(train_target[0])
    train_target = train_target.to(torch.float32) * 0.9
    test_target = test_target.to(torch.float32) * 0.9

    w1 = torch.empty(50, train_input.shape[1]).normal_(0, 1e-6)
    b1 = torch.empty(50).normal_(0, 1e-6)
    w2 = torch.empty(10, 50).normal_(0, 1e-6)
    b2 = torch.empty(10).normal_(0, 1e-6)

    dl_dw1 = torch.empty(50, train_input.shape[1]).fill_(0)
    dl_db1 = torch.empty(50).fill_(0)
    dl_dw2 = torch.empty(10, 50).fill_(0)
    dl_db2 = torch.empty(10).fill_(0)

    step_size = 0.1 / train_input.shape[0]

    num_steps = 1000

    for _ in range(num_steps):
        nb_train_errors = 0
        nb_test_errors = 0
        training_loss = 0
        test_loss = 0
        for i in range(train_input.shape[0]):
            x0, s1, x1, s2, x2 = forward_pass(w1, b1, w2, b2, train_input[i])
            pred_idx = x2.max(1)[1].item()
            if train_target[i, pred_idx] < 0.5:
                nb_train_errors += 1
            training_loss += loss(x2, train_target[i])
            dl_dw1.fill_(0)
            dl_db1.fill_(0)
            dl_dw2.fill_(0)
            dl_db2.fill_(0)
            backward_pass(
                w1,
                b1,
                w2,
                b2,
                train_target[i],
                train_input[i],
                s1,
                x1,
                s2,
                x2,
                dl_dw1,
                dl_db1,
                dl_dw2,
                dl_db2,
            )
            w1 -= step_size * dl_dw1
            b1 -= step_size * dl_db1
            w2 -= step_size * dl_dw2
            b2 -= step_size * dl_db2

        for i in range(test_input.shape[0]):
            _, _, _, _, x2 = forward_pass(w1, b1, w2, b2, test_input[i])
            pred_idx = x2.max(1)[1].item()
            if test_target[i, pred_idx] < 0.5:
                nb_test_errors += 1
            test_loss += loss(x2, test_target[i])

        print(
            f"Train loss: {training_loss:.02f}, test loss: {test_loss:.02f}, Train error rate: {100 * (nb_train_errors / train_input.shape[0]):.02f}, test error rate: {100 * (nb_test_errors / test_input.shape[0]):.02f}"
        )
